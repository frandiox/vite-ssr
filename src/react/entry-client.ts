import React, { ReactElement } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import {
  BrowserRouter,
  BrowserRouterProps,
  useNavigate,
} from 'react-router-dom'
import createClientContext from '../core/entry-client.js'
import { withoutSuffix } from '../utils/route'
import type { ClientHandler, Context } from './types'
import { createRouter } from './utils'

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
      BrowserRouter as React.FunctionComponent<BrowserRouterProps>,
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
    const el = document.getElementById(__CONTAINER_ID__)!

    styles && styles.cleanup && styles.cleanup()

    if (__DEV__) {
      const root = createRoot(el)
      root.render(app)
    } else {
      hydrateRoot(el, app)
    }
  }
}

export default viteSSR
