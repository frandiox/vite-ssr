import './index.css'
import App from './App.vue'
import routes from './routes'
import viteSSR from 'vite-ssr'

// Use route.meta.state as props
routes.forEach((route) => {
  route.props = (r) => ({ ...(r.meta.state || {}), ...(r.props || {}) })
})

export default viteSSR(
  App,
  { routes },
  ({ app, router, isClient, request }) => {
    // The 'request' is the original server request (undefined in browser)

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
