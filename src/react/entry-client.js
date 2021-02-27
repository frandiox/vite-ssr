import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { withoutSuffix } from '../utils/route'

export default async function (App, { base, debug = {} } = {}, hook) {
  const url = window.location
  const routeBase = base && withoutSuffix(base({ url }), '/')

  const context = {
    url,
    initialState: window.__INITIAL_STATE__ || {},
    isClient: true,
  }

  const app = React.createElement(
    HelmetProvider,
    {},
    React.createElement(
      BrowserRouter,
      { basename: routeBase },
      React.createElement(App, context)
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
