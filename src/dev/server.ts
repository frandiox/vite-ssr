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

import type { WriteResponse } from '../utils/types'

// This cannot be imported from utils due to ESM <> CJS issues
const isRedirect = ({ status = 0 } = {}) => status >= 300 && status < 400

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

export type SsrOptions = {
  plugin?: string
  ssr?: string
  getRenderContext?: (params: {
    url: string
    request: connect.IncomingMessage
    response: ServerResponse
    resolvedEntryPoint: Record<string, any>
  }) => Promise<WriteResponse>
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

  function writeHead(response: ServerResponse, params: WriteResponse = {}) {
    if (params.status) {
      response.statusCode = params.status
    }

    if (params.statusText) {
      response.statusMessage = params.statusText
    }

    if (params.headers) {
      for (const [key, value] of Object.entries(params.headers)) {
        response.setHeader(key, value)
      }
    }
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
      const context =
        (options.getRenderContext &&
          (await options.getRenderContext({
            url,
            request,
            response,
            resolvedEntryPoint,
          }))) ||
        {}

      // This is used by Vitedge
      writeHead(response, context)
      if (isRedirect(context)) {
        return response.end()
      }

      const htmlParts = await render(url, { request, response, ...context })

      writeHead(response, htmlParts)
      if (isRedirect(htmlParts)) {
        return response.end()
      }

      response.setHeader('Content-Type', 'text/html')
      response.end(buildHtmlDocument(template, htmlParts))
    } catch (e) {
      server.ssrFixStacktrace(e)
      console.log(e.stack)
      next(e)
    }
  }

  return handleSsrRequest
}

export async function createSsrServer(
  options: InlineConfig & { polyfills?: boolean } = {}
) {
  // Enable SSR in the plugin
  process.env.__DEV_MODE_SSR = 'true'

  const viteServer = await createViteServer({
    ...options,
    server: options.server || { ...options },
  })

  if (options.polyfills !== false) {
    if (!globalThis.fetch) {
      const fetch = await import('node-fetch')
      // @ts-ignore
      globalThis.fetch = fetch.default || fetch
    }
  }

  return new Proxy(viteServer, {
    get(target, prop, receiver) {
      if (prop === 'listen') {
        return async (port?: number) => {
          const server = await target.listen(port)
          target.config.logger.info('\n -- SSR mode\n')
          return server
        }
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}
