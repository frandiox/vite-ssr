import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'
import { createRouter } from './utils'
export { ClientOnly } from './components.js'

export default async function (
  App,
  {
    routes,
    base,
    suspenseFallback,
    PropsProvider,
    pageProps,
    debug = {},
    transformState = (state) => state,
  } = {},
  hook
) {
  const url = window.location
  const routeBase = base && withoutSuffix(base({ url }), '/')
  const initialState = await transformState(window.__INITIAL_STATE__ || null)

  const context = {
    url,
    initialState: initialState || {},
    router: createRouter({
      routes,
      base,
      initialState,
      pagePropsOptions: pageProps,
      PropsProvider,
    }),
    isClient: true,
  }

  const app = React.createElement(
    HelmetProvider,
    {},
    React.createElement(
      BrowserRouter,
      { basename: routeBase },
      React.createElement(
        React.Suspense,
        { fallback: suspenseFallback || '' },
        React.createElement(App, context)
      )
    )
  )

  if (hook) {
    await hook(context)
  }

  if (debug.mount !== false) {
    const el = document.getElementById('app')

    import.meta.env.DEV ? ReactDOM.render(app, el) : ReactDOM.hydrate(app, el)
  }
}
