import { matchRoutes } from 'react-router-config'
import App from './App'
import { routes } from './routes'
import viteSSR from 'vite-ssr'
import { getPageProps } from './api'

export default viteSSR(App, { routes }, async ({ request, ...context }) => {
  // Unlike Vue, React doesn't have any native feature to await for
  // data fetching during server-side rendering. This hook is a simple
  // utility to workaround that. Initial state will be set to the
  // returned value of this hook (only in SSR).
  // Maybe it will be simpler with Suspense or Server Components.

  if (import.meta.env.SSR) {
    const [{ route } = {}] = matchRoutes(routes, new URL(request.url).pathname)
    const result = await getPageProps({ ...route, ...context, request })
    console.log('qqqqq', result)
    return result
  }
})
