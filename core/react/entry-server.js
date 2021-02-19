import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { parseHTML } from '../utils'
import { createUrl, getFullPath, withoutSuffix } from '../utils'

export default function (App, { base } = {}, hook) {
  return async function ({ request, manifest, preload = false, ...extra }) {
    const url = createUrl(request.url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const fullPath = getFullPath(url, routeBase)

    const context = { request, ...extra, initialState: {}, isClient: false }

    if (hook) {
      context.initialState =
        (await hook({
          request,
          ...context,
          ...extra,
        })) || context.initialState
    }

    const router = React.createElement(
      StaticRouter,
      {
        basename: routeBase,
        location: fullPath,
      },
      React.createElement(App, context)
    )

    const unparsedHtml = await ReactDOMServer.renderToString(router)

    const { html, htmlAttrs, head, bodyAttrs } = parseHTML(unparsedHtml)

    const initialState = JSON.stringify(context.initialState || {})

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      dependencies: [], // React does not populate the manifest context :(
    }
  }
}
