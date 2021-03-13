import React from 'react'

export function createRouter(routes, initialState) {
  let isFirstRoute = true
  let currentRoute = null
  return {
    getCurrentRoute: () => currentRoute,
    isFirstRoute: () => isFirstRoute,
    routes: routes.map((originalRoute) => {
      const meta = {
        ...(originalRoute.meta || {}),
        state: null,
      }

      const augmentedRoute = {
        ...originalRoute,
        meta,
        component: (props) => {
          currentRoute = augmentedRoute

          if (!import.meta.env.SSR && isFirstRoute) {
            meta.state = initialState
            isFirstRoute = false
          }

          return React.createElement(originalRoute.component, props)
        },
      }

      return augmentedRoute
    }),
  }
}
