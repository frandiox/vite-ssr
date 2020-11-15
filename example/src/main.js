import './index.css'
import App from './App.vue'
import routes from './routes'
import viteSSR from 'vite-ssr'

// This piece will move route.meta.state to Page props.
// This can be ignored if you prefer Vuex instead of Page props.
routes.forEach((route) => {
  route.props = (r) => ({ ...(r.meta.state || {}), ...(r.props || {}) })
})

export default viteSSR(
  App,
  { routes },
  ({ app, router, isClient, request, initialState }) => {
    // The 'request' is the original server request (undefined in browser).
    // The 'initialState' is only available in the browser and can be used to
    // pass it to Vuex, for example, if you prefer to rely on stores rather than Page props.

    router.beforeEach(async (to, from, next) => {
      if (to.meta.state) {
        // This route has state already (from server) so it can be reused.
        return next()
      }

      const baseUrl = isClient ? '' : new URL(request.url).origin

      try {
        // Get our page props from our custom API:
        const res = await fetch(
          `${baseUrl}/api/getProps?path=${encodeURIComponent(to.path)}&name=${
            to.name
          }&client=${isClient}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        to.meta.state = await res.json()
      } catch (error) {
        console.error(error)
        // redirect to error route
      }

      next()
    })
  }
)
