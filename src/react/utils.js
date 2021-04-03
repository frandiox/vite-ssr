import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getFullPath } from '../utils/route'
import { createUrl } from '../utils/route'

export function createRouter({
  base,
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
        const { pathname, hash, search } = useLocation()
        const url = createUrl(pathname + search + hash)
        const routeBase = base && base({ url })

        const from = currentRoute
        const to = {
          ...augmentedRoute,
          path: pathname,
          hash,
          search,
          params: useParams(),
          query: Object.fromEntries(url.searchParams),
          fullPath: getFullPath(url, routeBase),
        }

        if (!currentRoute) {
          // First route, use provided initialState
          meta.state = initialState
        }

        currentRoute = to

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
