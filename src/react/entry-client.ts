import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, useHistory } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'
import { deserializeState } from '../utils/state'
import { useClientRedirect } from '../utils/response'
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
    styleCollector,
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

  const { redirect, writeResponse } = useClientRedirect((location) => {
    const { push } = useHistory()
    React.useEffect(() => push(location), [push])
  })

  const context = {
    url,
    initialState: initialState || {},
    isClient: true,
    redirect,
    writeResponse,
    router: createRouter({
      routes,
      base,
      initialState,
      pagePropsOptions: pageProps,
      PropsProvider,
    }),
  } as Context

  let app: ReactElement = React.createElement(
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

  const styles = styleCollector && (await styleCollector(context))
  if (styles && styles.provide) {
    app = styles.provide(app)
  }

  if (hook) {
    await hook(context)
  }

  if (debug.mount !== false) {
    const el = document.getElementById('app')

    styles && styles.cleanup && styles.cleanup()

    // @ts-ignore
    import.meta.env.DEV ? ReactDOM.render(app, el) : ReactDOM.hydrate(app, el)
  }
}

export default viteSSR
