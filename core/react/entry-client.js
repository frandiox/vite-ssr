import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { withoutSuffix } from '../utils'

export default async function (App, { base, debug = {} } = {}, hook) {
  const url = window.location
  const routeBase = base && withoutSuffix(base({ url }), '/')

  const context = {
    initialState: window.__INITIAL_STATE__ || {},
    isClient: true,
  }

  const router = React.createElement(
    BrowserRouter,
    { basename: routeBase },
    React.createElement(App, context)
  )

  if (hook) {
    await hook({
      router,
      ...context,
    })
  }

  if (debug.mount !== false) {
    const el = document.getElementById('app')

    import.meta.env.DEV
      ? ReactDOM.render(router, el)
      : ReactDOM.hydrate(router, el)
  }
}
