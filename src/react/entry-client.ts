import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'
import { deserializeState } from '../utils/state'
import { createRouter } from './utils'
export { ClientOnly } from './components'
import type { ClientHandler } from './types'

export const viteSSR: ClientHandler = async function (
  App,
  {
    routes,
    base,
    suspenseFallback,
    PropsProvider,
    pageProps,
    debug = {},
    transformState = deserializeState,
  },
  hook
) {
  const url = window.location
  const routeBase = base && withoutSuffix(base({ url }), '/')
  const initialState = await transformState(
    // @ts-ignore
    window.__INITIAL_STATE__ || null,
    deserializeState
  )

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

    setTimeout(() => {
      Array.from(
        document.querySelectorAll('[data-remove-on-hydration]')
      ).forEach((el) => el.parentElement && el.parentElement.removeChild(el))
    })

    // @ts-ignore
    import.meta.env.DEV ? ReactDOM.render(app, el) : ReactDOM.hydrate(app, el)
  }
}

export default viteSSR
