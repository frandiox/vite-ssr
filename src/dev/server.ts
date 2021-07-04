import type { ServerResponse } from 'http'
import { promises as fs } from 'fs'
import path from 'path'
import connect, { NextHandleFunction } from 'connect'
import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import { getEntryPoint } from '../config'
import { buildHtmlDocument } from '../build/utils'

function fixEntryPoint(vite: ViteDevServer) {
  // The plugin is redirecting to the entry-client for the SPA,
  // but we need to reach the entry-server here. This trick
  // replaces the plugin behavior in the config and seems
  // to keep the entry-client for the SPA.
  for (const alias of vite.config.resolve.alias || []) {
    // @ts-ignore
    if (alias._viteSSR === true) {
      alias.replacement = alias.replacement.replace('client', 'server')
    }
  }
}

type ResponseLike = {
  status?: number
  statusText?: string
  initialState?: any
  headers?: Record<string, string>
  [key: string]: any
}

export type SsrOptions = {
  plugin?: string
  ssr?: string
  getRenderContext?: (params: {
    url: string
    request: connect.IncomingMessage
    response: ServerResponse
    resolvedEntryPoint: Record<string, any>
  }) => Promise<ResponseLike>
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

  function respondWithRedirect(
    response: ServerResponse,
    context: ResponseLike = {}
  ) {
    response.writeHead(
      context.status || 302,
      context.statusText || '',
      context.headers || {}
    )

    return response.end(context.body)
  }

  const handleSsrRequest: NextHandleFunction = async (
    request,
    response,
    next
  ) => {
    if (request.method !== 'GET' || request.originalUrl === '/favicon.ico') {
      return next()
    }

    fixEntryPoint(server)

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
        return respondWithRedirect(response, context)
      }

      const htmlParts = await render(url, { request, response, ...context })
      const html = buildHtmlDocument(template, htmlParts)

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
