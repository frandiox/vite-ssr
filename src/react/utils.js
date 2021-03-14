import React from 'react'

export function createRouter({ routes, initialState, PropsProvider }) {
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
          const from = currentRoute
          const to = augmentedRoute

          if (!import.meta.env.SSR && !currentRoute) {
            // First route in browser
            meta.state = initialState
          }

          currentRoute = augmentedRoute

          if (PropsProvider) {
            return React.createElement(
              PropsProvider,
              { ...props, from, to },
              originalRoute.component
            )
          }

          return React.createElement(originalRoute.component, props)
        },
      }

      return augmentedRoute
    }),
  }
}
