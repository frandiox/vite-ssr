import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { parseHTML } from '../utils/html'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'

export default function (App, { base } = {}, hook) {
  return async function (url, { manifest, preload = false, ...extra } = {}) {
    url = createUrl(url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const fullPath = getFullPath(url, routeBase)

    const context = { url, isClient: false, initialState: {}, ...extra }

    if (hook) {
      context.initialState =
        (await hook({ ...context })) || context.initialState
    }

    const router = React.createElement(
      StaticRouter,
      {
        basename: routeBase,
        location: fullPath,
      },
      React.createElement(App, context)
    )

    const rawAppHtml = await ReactDOMServer.renderToString(router)

    const { body, htmlAttrs, head, bodyAttrs } = parseHTML(rawAppHtml)

    const initialState = JSON.stringify(context.initialState || {})

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      htmlAttrs,
      head,
      body,
      bodyAttrs,
      initialState,
      dependencies: [], // React does not populate the manifest context :(
    }
  }
}
