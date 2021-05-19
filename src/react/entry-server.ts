import React, { ReactElement } from 'react'
import ssrPrepass from 'react-ssr-prepass'
import { renderToString } from 'react-dom/server.js'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { serializeState } from '../utils/state'
import { createRouter } from './utils'
export { ClientOnly } from './components'
import type { SsrHandler } from './types'

let render: (element: ReactElement) => string | Promise<string> = renderToString

// @ts-ignore
if (__USE_APOLLO_RENDERER__) {
  // Apollo does not support Suspense so it needs its own
  // renderer in order to await for async queries.
  // @ts-ignore
  import('@apollo/client/react/ssr')
    .then(({ renderToStringWithData }) => {
      render = renderToStringWithData
    })
    .catch(() => null)
}

let appWrapper = (el: any, ctx: object) => el

// @ts-ignore
if (__USE_STYLED_COMPONENTS__) {
  // @ts-ignore
  import('./styled/styled-components')
    .then(({ appStyledWrapper }) => {
      appWrapper = appStyledWrapper
    })
    .catch(() => null)
}

const viteSSR: SsrHandler = function (
  App,
  {
    routes,
    base,
    prepassVisitor,
    PropsProvider,
    pageProps,
    transformState = serializeState,
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

    const styledContext = {}
    const app = appWrapper(
      React.createElement(
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
      ),
      styledContext
    )

    await ssrPrepass(app, prepassVisitor)
    const body = await render(app)

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

    const styleTags: string =
      // @ts-ignore
      (styledContext.styles && styledContext.styles()) || ''

    const headTags =
      Object.keys(tags)
        .map((key) => (tags[key] || '').toString())
        .join('') +
      '\n' +
      styleTags

    const initialState = await transformState(
      context.initialState || {},
      serializeState
    )

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
