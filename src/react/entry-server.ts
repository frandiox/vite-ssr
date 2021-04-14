import React from 'react'
import ssrPrepass from 'react-ssr-prepass'
import { renderToString } from 'react-dom/server.js'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { createRouter } from './utils'
export { ClientOnly } from './components'
import type { SsrHandler } from './types'

const viteSSR: SsrHandler = function (
  App,
  {
    routes,
    base,
    prepassVisitor,
    PropsProvider,
    pageProps,
    transformState = (state) => JSON.stringify(state || {}),
  },
  hook
) {
  return async function (url, { manifest, preload = false, ...extra } = {}) {
    url = createUrl(url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const fullPath = getFullPath(url, routeBase)

    const context = {
      url,
      isClient: false,
      initialState: {},
      ...extra,
      router: createRouter({
        routes,
        base,
        initialState: extra.initialState || null,
        pagePropsOptions: pageProps,
        PropsProvider,
      }),
    }

    if (hook) {
      context.initialState = (await hook(context)) || context.initialState
    }

    const helmetContext: Record<string, Record<string, string>> = {}

    const app = React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        StaticRouter,
        {
          basename: routeBase,
          location: fullPath,
        },
        React.createElement(App, context)
      )
    )

    await ssrPrepass(app, prepassVisitor)
    const body = renderToString(app)

    const currentRoute = context.router.getCurrentRoute()
    if (currentRoute) {
      Object.assign(
        context.initialState || {},
        (currentRoute.meta || {}).state || {}
      )
    }

    const {
      htmlAttributes: htmlAttrs = '',
      bodyAttributes: bodyAttrs = '',
      ...tags
    } = helmetContext.helmet || {}

    const headTags = Object.keys(tags)
      .map((key) => (tags[key] || '').toString())
      .join('')

    const initialState = await transformState(context.initialState || {})

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      htmlAttrs,
      headTags,
      body,
      bodyAttrs,
      initialState,
      dependencies: [], // React does not populate the manifest context :(
    }
  }
}

export default viteSSR
