import React, { ReactElement } from 'react'
import ssrPrepass from 'react-ssr-prepass'
import { renderToString } from 'react-dom/server.js'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { serializeState } from '../utils/state'
import { createRouter } from './utils'
import { useResponseSSR } from '../utils/response'
import type { Context, SsrHandler } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

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

// @ts-ignore
if (__USE_MATERIAL_UI__) {
  // @ts-ignore
  import('./styled/material-ui-core')
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

    const { deferred, response, writeResponse, isRedirect } = useResponseSSR()

    const context = {
      url,
      isClient: false,
      initialState: {},
      writeResponse,
      ...extra,
      router: createRouter({
        routes,
        base,
        initialState: extra.initialState || null,
        pagePropsOptions: pageProps,
        PropsProvider,
      }),
    } as Context

    if (hook) {
      context.initialState = (await hook(context)) || context.initialState
    }

    if (isRedirect()) return response

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
          provideContext(React.createElement(App, context), context)
        )
      ),
      styledContext
    )

    ssrPrepass(app, prepassVisitor)
      .then(() => render(app))
      .then(deferred.resolve)
      .catch(deferred.reject)

    const body = await deferred.promise

    if (isRedirect()) return response

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
      ...(response || {}),
    }
  }
}

export default viteSSR
