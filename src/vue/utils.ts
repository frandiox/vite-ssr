import type { ExtendedRouteRaw, ExtendedRouteNormalized } from './types'

export function addPagePropsGetterToRoutes(routes: ExtendedRouteRaw[]) {
  routes.forEach((route) => {
    route.props = (r: ExtendedRouteNormalized) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })
}
