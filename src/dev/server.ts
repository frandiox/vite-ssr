import type { ServerResponse } from 'http'
import { promises as fs } from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'
import connect, { NextHandleFunction } from 'connect'
import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import chalk from 'chalk'
import { getEntryPoint, getPluginOptions } from '../config'

import type { WriteResponse } from '../utils/types'

// This cannot be imported from utils due to ESM <> CJS issues
const isRedirect = ({ status = 0 } = {}) => status >= 300 && status < 400

export interface SsrOptions {
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
  // Fix, because newer versions of vite's inlineConfig contains "ssr" property which type is object
  let { ssr, ...otherOptions } = server.config.inlineConfig as InlineConfig & {
    ssr?: InlineConfig['ssr'] | string
  }

  if (typeof ssr != 'string') {
    ssr = undefined
  }

  options = {
    ...{ ssr, ...otherOptions }, // CLI flags
    ...options,
  }

  const pluginOptions = getPluginOptions(server.config)
  const resolve = (p: string) => path.resolve(server.config.root, p)
  async function getIndexTemplate(url: string) {
    // Template should be fresh in every request
    const indexHtml = await fs.readFile(
      pluginOptions.input || resolve('index.html'),
      'utf-8'
    )
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

    let template: string

    try {
      template = await getIndexTemplate(request.originalUrl as string)
    } catch (error) {
      server.ssrFixStacktrace(error as Error)
      return next(error)
    }

    try {
      const entryPoint =
        options.ssr || (await getEntryPoint(server.config, template))

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

      const result = await render(url, {
        request,
        response,
        template,
        ...context,
      })

      writeHead(response, result)
      if (isRedirect(result)) {
        return response.end()
      }

      response.setHeader('Content-Type', 'text/html')
      response.end(result.html)
    } catch (error) {
      // Send back template HTML to inject ViteErrorOverlay
      response.setHeader('Content-Type', 'text/html')
      response.end(template)

      // Wait until browser injects ViteErrorOverlay
      // custom element from the previous template
      setTimeout(() => next(error), 250)
      server.ssrFixStacktrace(error as Error)
    }
  }

  return handleSsrRequest
}

export async function createSsrServer({
  force,
  ...options
}: InlineConfig & { polyfills?: boolean; force?: boolean } = {}) {
  // Enable SSR in the plugin
  process.env.__DEV_MODE_SSR = 'true'

  if (force) {
    options.optimizeDeps ??= {}
    options.optimizeDeps.force = force
  }

  const viteServer = await createViteServer({
    ...options,
    server: options.server,
  })

  if (options.polyfills !== false) {
    if (!globalThis.fetch) {
      const fetch = await import('node-fetch')
      // @ts-ignore
      globalThis.fetch = fetch.default || fetch
    }
  }

  const isMiddlewareMode =
    // @ts-ignore
    options?.middlewareMode || options?.server?.middlewareMode

  return new Proxy(viteServer, {
    get(target, prop, receiver) {
      if (prop === 'listen') {
        return async (port?: number) => {
          const server = await target.listen(port)

          if (!isMiddlewareMode) {
            printServerInfo(server)
          }

          return server
        }
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

export function printServerInfo(server: ViteDevServer) {
  const info = server.config.logger.info

  let ssrReadyMessage = '\n -- SSR mode'

  if (Object.prototype.hasOwnProperty.call(server, 'printUrls')) {
    info(
      chalk.cyan(`\n  vite v${require('vite/package.json').version}`) +
        chalk.green(` dev server running at:\n`),
      { clear: !server.config.logger.hasWarned }
    )

    // @ts-ignore
    server.printUrls()

    // @ts-ignore
    if (globalThis.__ssr_start_time) {
      ssrReadyMessage += chalk.cyan(
        ` ready in ${Math.round(
          // @ts-ignore
          performance.now() - globalThis.__ssr_start_time
        )}ms.`
      )
    }
  }

  info(ssrReadyMessage + '\n')
}
