import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { createUrl, getFullPath } from '../utils/route'
import type { Base, Meta, PagePropsOptions, State } from '../utils/types'
import type { PropsProvider as PropsProviderType, RouteRaw } from './types'

type RouterOptions = {
  base?: Base
  routes: RouteRaw[]
  initialState?: State
  PropsProvider?: PropsProviderType
  pagePropsOptions?: PagePropsOptions
}

export function createRouter({
  base,
  routes,
  initialState,
  PropsProvider,
  pagePropsOptions = { passToPage: true },
}: RouterOptions) {
  let currentRoute: RouteRaw | undefined = undefined

  function augmentRoute(originalRoute: RouteRaw) {
    const meta: Meta = {
      ...(originalRoute.meta || {}),
      state: null,
    }

    const augmentedRoute: RouteRaw = {
      ...originalRoute,
      meta,
      component: (props: Record<string, any>) => {
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

      // Nested routes compatibility with React Router 6
      augmentedRoute.children = augmentedRoute.routes
    }

    return augmentedRoute
  }

  return {
    getCurrentRoute: () => currentRoute,
    isFirstRoute: () => !currentRoute,
    routes: routes.map(augmentRoute),
  }
}

export type Router = ReturnType<typeof createRouter>
