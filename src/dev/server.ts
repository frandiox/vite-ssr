import { promises as fs } from 'fs'
import path from 'path'
import connect, { NextHandleFunction } from 'connect'
import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import { getEntryPoint } from '../config'
import type { ServerResponse } from 'node:http'

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

export type SsrOptions = {
  plugin?: string
  ssr?: string
  getRenderContext?: (params: {
    url: string
    request: connect.IncomingMessage
    response: ServerResponse
    resolvedEntryPoint: Record<string, any>
  }) => Promise<any>
}

export const createSSRDevHandler = (
  server: ViteDevServer,
  options: SsrOptions = {}
) => {
  options = {
    ...server.config.inlineConfig, // CLI flags
    ...options,
  }

  const resolve = (p: string) => path.resolve(server.config.root, p)
  async function getIndexTemplate(url: string) {
    // Template should be fresh in every request
    const indexHtml = await fs.readFile(resolve('index.html'), 'utf-8')
    return await server.transformIndexHtml(url, indexHtml)
  }

  const handleSsrRequest: NextHandleFunction = async (
    request,
    response,
    next
  ) => {
    if (request.method !== 'GET' || request.originalUrl === '/favicon.ico') {
      return next()
    }

    fixEntryPoint(server, options.plugin || 'vite-ssr')

    try {
      const template = await getIndexTemplate(request.originalUrl as string)
      const entryPoint =
        options.ssr || (await getEntryPoint(server.config.root, template))

      let resolvedEntryPoint = await server.ssrLoadModule(resolve(entryPoint))
      resolvedEntryPoint = resolvedEntryPoint.default || resolvedEntryPoint
      const render = resolvedEntryPoint.render || resolvedEntryPoint

      const protocol =
        // @ts-ignore
        request.protocol ||
        (request.headers.referer || '').split(':')[0] ||
        'http'

      const url = protocol + '://' + request.headers.host + request.originalUrl

      // This context might contain initialState provided by other plugins
      const context = options.getRenderContext
        ? await options.getRenderContext({
            url,
            request,
            response,
            resolvedEntryPoint,
          })
        : {}

      if (context && context.status) {
        // If response-like is provided, just return the response
        for (const [key, value] of Object.entries(context.headers || {})) {
          response.setHeader(key, value as string)
        }

        response.statusCode = context.status
        response.statusMessage = context.statusText

        return response.end(context.body)
      }

      const { headTags, body, bodyAttrs, htmlAttrs, initialState } =
        await render(url, { request, response, ...context })

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
      server.ssrFixStacktrace(e)
      console.log(e.stack)
      next(e)
    }
  }

  return handleSsrRequest
}

export default async function createSsrServer(
  options: SsrOptions & InlineConfig = {}
) {
  // Enable SSR in the plugin
  process.env.__DEV_MODE_SSR = 'true'

  const viteServer = await createViteServer({
    ...options,
    server: options,
  })

  return {
    async listen(port?: number) {
      if (!globalThis.fetch) {
        const fetch = await import('node-fetch')
        // @ts-ignore
        globalThis.fetch = fetch.default || fetch
      }

      await viteServer.listen(port)
      viteServer.config.logger.info('\n -- SSR mode\n')
    },
  }
}
