// @ts-ignore
const fs = require('fs').promises
const path = require('path')
const connect = require('connect')
const { createServer: createViteServer, resolveConfig } = require('vite')
const { getEntryPoint } = require('../config')

async function resolveHttpServer(app) {
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
    let tmp = await fs.readFile(vitePath, 'utf-8')
    const [, chunk] = tmp.match(/require\('(\.\/chunks\/.+)'\)/)
    tmp = null

    const internals = require(path.resolve(path.dirname(vitePath), chunk))

    return internals.resolveHttpServer(config.server, app)
  } catch (error) {
    console.warn(
      '\nCould not import internal Vite module. This likely means Vite internals have been updated in a new version.\n'
    )

    throw error
  }
}

async function createSsrServer(options = {}) {
  const { plugin: pluginName = 'vite-ssr' } = options

  const app = connect()
  const httpServer = await resolveHttpServer(app)
  const vite = await createViteServer({
    server: { middlewareMode: true },
  })

  app.use(vite.middlewares)

  // The plugin is redirecting to the entry-client for the SPA,
  // but we need to reach the entry-server here. This trick
  // replaces the plugin behavior in the config and seems
  // to keep the entry-client for the SPA.
  const alias = vite.config.resolve.alias.find(
    (item) =>
      typeof item.replacement === 'string' &&
      (item.replacement || '').includes(pluginName)
  )
  alias.replacement = alias.replacement.replace('client', 'server')

  // Find Vite SSR options added by another that uses it internally.
  options = Object.assign(
    {},
    (vite.config.plugins.find((plugin) => plugin.name === pluginName) || {})
      .viteSsr || {},
    options
  )

  const resolve = (p) => path.resolve(vite.config.root, p)
  async function getIndexTemplate(url) {
    // Template should be fresh in every request
    const indexHtml = await fs.readFile(resolve('index.html'), 'utf-8')
    return await vite.transformIndexHtml(url, indexHtml)
  }

  app.use(async (request, response, next) => {
    if (request.method !== 'GET') {
      return next()
    }

    try {
      const template = await getIndexTemplate(request.url)
      const entryPoint = await getEntryPoint(vite.config.root, template)

      let resolvedEntryPoint = await vite.ssrLoadModule(resolve(entryPoint))
      resolvedEntryPoint = resolvedEntryPoint.default || resolvedEntryPoint
      const render = resolvedEntryPoint.render || resolvedEntryPoint

      const protocol =
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
        htmlAttrs,
        head,
        body,
        bodyAttrs,
        initialState,
      } = await render(url, { request, response, ...context })

      // These replacements should be similar to the build behavior
      const html = template
        .replace('<html', `<html ${htmlAttrs} `)
        .replace('<body', `<body ${bodyAttrs} `)
        .replace('</head>', `${head}\n</head>`)
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

  return {
    listen(port = 3000, host = 'localhost', cb) {
      globalThis.fetch = require('node-fetch')

      httpServer.listen(
        port,
        host,
        cb || (() => console.log(`http://${host}:${port}`))
      )
    },
  }
}

module.exports = createSsrServer
