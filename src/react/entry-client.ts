import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, useHistory } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'
import { deserializeState } from '../utils/state'
import { useResponseClient } from '../utils/response'
import { createRouter } from './utils'
import type { ClientHandler, Context } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

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

  const { writeResponse } = useResponseClient({
    spaRedirect: (location) => useHistory().push(location),
  })

  const context = {
    url,
    initialState: initialState || {},
    isClient: true,
    writeResponse,
    router: createRouter({
      routes,
      base,
      initialState,
      pagePropsOptions: pageProps,
      PropsProvider,
    }),
  } as Context

  const app = React.createElement(
    HelmetProvider,
    {},
    React.createElement(
      BrowserRouter,
      { basename: routeBase },
      React.createElement(
        React.Suspense,
        { fallback: suspenseFallback || '' },
        provideContext(React.createElement(App, context), context)
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
