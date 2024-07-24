import React, { ReactElement } from 'react'
import ReactDOM from 'react-dom'
import createClientContext from '../core/entry-client.js'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'
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
    styleCollector,
    ...options
  },
  hook
) {
  const url = new URL(window.location.href)
  const routeBase = base && withoutSuffix(base({ url }), '/')

  const ctx = await createClientContext({
    ...options,
    url,
    spaRedirect: (location) => {
      const navigate = useNavigate()
      React.useEffect(() => navigate(location), [navigate])
    },
  })

  const context = ctx as Context
  context.router = createRouter({
    routes,
    base,
    initialState: context.initialState,
    pagePropsOptions: pageProps,
    PropsProvider,
  })

  if (hook) {
    await hook(context)
  }

  let app: ReactElement = React.createElement(
    HelmetProvider,
    {},
    React.createElement(
      // @ts-ignore
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

  if (debug.mount !== false) {
    // @ts-ignore
    const el = document.getElementById(__CONTAINER_ID__)

    styles && styles.cleanup && styles.cleanup()

    // @ts-ignore
    __VITE_SSR_DEV__ ? ReactDOM.render(app, el) : ReactDOM.hydrate(app, el)
  }
}

export default viteSSR
