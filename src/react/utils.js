import React from 'react'

export function createRouter({
  routes,
  initialState,
  PropsProvider,
  pagePropsOptions = { passToPage: true },
}) {
  let currentRoute = null

  function augmentRoute(originalRoute) {
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

        if (!currentRoute) {
          // First route, use provided initialState
          meta.state = initialState
        }

        currentRoute = augmentedRoute

        if (PropsProvider) {
          return React.createElement(
            PropsProvider,
            { ...props, from, to, pagePropsOptions },
            originalRoute.component
          )
        }

        const { passToPage } = pagePropsOptions || {}
        return React.createElement(originalRoute.component, {
          ...props,
          ...((passToPage && meta.state) || {}),
        })
      },
    }

    if (Array.isArray(originalRoute.routes)) {
      augmentedRoute.routes = originalRoute.routes.map(augmentRoute)
    }

    return augmentedRoute
  }

  return {
    getCurrentRoute: () => currentRoute,
    isFirstRoute: () => !currentRoute,
    routes: routes.map(augmentRoute),
  }
}
