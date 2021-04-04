import { promises as fs } from 'fs'
import path from 'path'
import connect from 'connect'
import {
  createServer as createViteServer,
  InlineConfig,
  resolveConfig,
  ViteDevServer,
} from 'vite'
import { getEntryPoint } from '../config'
import type { ServerResponse } from 'node:http'

async function resolveHttpServer(app: connect.Server) {
  const config = await resolveConfig(
    {},
    'serve',
    process.env.NODE_ENV || 'development'
  )

  try {
    // In order to have the same behavior as Vite dev itself,
    // we need to create the HTTP server in the same way as Vite does.
    // However, Vite does not expose its internal HTTP server creator function.
    // This should find that function in Vite internals but might need to be
    // adjusted from time to time if this is updated in Vite.
    const vitePath = require.resolve('vite')
    let tmp: string | null = await fs.readFile(vitePath, 'utf-8')
    const [, chunk] = tmp.match(/require\('(\.\/chunks\/.+)'\)/) || []
    tmp = null

    let internals = await import(path.resolve(path.dirname(vitePath), chunk))
    internals = internals.default || internals

    return internals.resolveHttpServer(config.server, app)
  } catch (error) {
    console.warn(
      '\nCould not import internal Vite module. This likely means Vite internals have been updated in a new version.\n'
    )

    throw error
  }
}

function fixEntryPoint(vite: ViteDevServer, pluginName: string) {
  // The plugin is redirecting to the entry-client for the SPA,
  // but we need to reach the entry-server here. This trick
  // replaces the plugin behavior in the config and seems
  // to keep the entry-client for the SPA.
  const alias = vite.config.resolve.alias.find(
    (item) =>
      typeof item.replacement === 'string' &&
      (item.replacement || '').includes(pluginName)
  )

  if (alias) {
    alias.replacement = alias.replacement.replace('client', 'server')
  }
}

type SsrOptions = InlineConfig & {
  plugin?: string
  config?: string
  ssr?: string
  getRenderContext?: (params: {
    url: string
    request: connect.IncomingMessage
    response: ServerResponse
    resolvedEntryPoint: Record<string, any>
  }) => Promise<any>
}

export default async function createSsrServer(options: SsrOptions = {}) {
  const { plugin: pluginName = 'vite-ssr' } = options

  const app = connect()
  const httpServer = await resolveHttpServer(app)
  const vite = await createViteServer({
    base: options.base,
    mode: options.mode,
    configFile: options.config,
    logLevel: options.logLevel,
    clearScreen: options.clearScreen,
    server: {
      ...options,
      middlewareMode: true,
    },
  })

  app.use(vite.middlewares)

  // Find Vite SSR options added by another plugin that uses internally (e.g. Vitedge).
  options = Object.assign(
    {},
    (vite.config.plugins.find((plugin) => plugin.name === pluginName) as any)
      ?.viteSsr || {},
    options
  )

  const resolve = (p: string) => path.resolve(vite.config.root, p)
  async function getIndexTemplate(url: string) {
    // Template should be fresh in every request
    const indexHtml = await fs.readFile(resolve('index.html'), 'utf-8')
    return await vite.transformIndexHtml(url, indexHtml)
  }

  app.use(async (request, response, next) => {
    if (request.method !== 'GET' || request.url === '/favicon.ico') {
      return next()
    }

    fixEntryPoint(vite, pluginName)

    try {
      const template = await getIndexTemplate(request.url as string)
      const entryPoint =
        options.ssr || (await getEntryPoint(vite.config.root, template))

      let resolvedEntryPoint = await vite.ssrLoadModule(resolve(entryPoint))
      resolvedEntryPoint = resolvedEntryPoint.default || resolvedEntryPoint
      const render = resolvedEntryPoint.render || resolvedEntryPoint

      const protocol =
        // @ts-ignore
        request.protocol ||
        (request.headers.referer || '').split(':')[0] ||
        'http'

      const url = protocol + '://' + request.headers.host + request.url

      // This context might contain initialState provided by other plugins
      const context = options.getRenderContext
        ? await options.getRenderContext({
            url,
            request,
            response,
            resolvedEntryPoint,
          })
        : {}

      const {
        headTags,
        body,
        bodyAttrs,
        htmlAttrs,
        initialState,
      } = await render(url, { request, response, ...context })

      // These replacements should be similar to the build behavior
      const html = template
        .replace('<html', `<html ${htmlAttrs} `)
        .replace('<body', `<body ${bodyAttrs} `)
        .replace('</head>', `${headTags}\n</head>`)
        .replace(
          '<div id="app"></div>',
          `<div id="app" data-server-rendered="true">${body}</div>\n\n<script>window.__INITIAL_STATE__=${initialState}</script>`
        )

      response.setHeader('Content-Type', 'text/html')
      response.end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.log(e.stack)
      next(e)
    }
  })

  // Add the custom server back to Vite in order
  // to reuse its own terminal output style, etc.
  vite.httpServer = httpServer

  return {
    async listen(port?: number) {
      const fetch = await import('node-fetch')
      // @ts-ignore
      globalThis.fetch = fetch.default || fetch

      await vite.listen(port)
      vite.config.logger.info('\n -- SSR mode\n')
    },
  }
}
