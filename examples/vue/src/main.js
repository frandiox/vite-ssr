import './index.css'
import App from './App.vue'
import routes from './routes'
import viteSSR from 'vite-ssr'
import { Helmet } from 'vite-ssr/components'

// This piece will move route.meta.state to Page props.
// This can be ignored if you prefer Vuex instead of Page props.
routes.forEach((route) => {
  route.props = (r) => ({ ...(r.meta.state || {}), ...(r.props || {}) })
})

export default viteSSR(
  App,
  { routes },
  ({ app, router, isClient, url, initialState, initialRoute }) => {
    app.component(Helmet.name, Helmet)

    // The 'initialState' is hydrated in the browser and can be used to
    // pass it to Vuex, for example, if you prefer to rely on stores rather than page props.
    // In the server, 'initialState' is an empty object that can be mutated. It can be
    // passed to Vuex, or provide it to child components (see Homepage for an example).
    app.provide('initialState', initialState)

    // Before each route navigation we request the data needed for showing the page.
    router.beforeEach(async (to, from, next) => {
      if (!!to.meta.state && (!import.meta.env.DEV || import.meta.env.SSR)) {
        // This route has state already (from server) so it can be reused.
        // State is always empty in SPA development, but present in SSR development.
        return next()
      }

      // `isClient` here is a handy way to determine if it's SSR or not.
      // However, it is a runtime variable so it won't be tree-shaked.
      // Use Vite's `import.meta.env.SSR` instead for tree-shaking.
      const baseUrl = isClient ? '' : url.origin

      // Explanation:
      // The first rendering happens in the server. Therefore, when this code runs,
      // the server makes a request to itself (running the code below) in order to
      // get the current page props and use that response to render the HTML.
      // The browser shows this HTML and rehydrates the application, turning it into
      // a normal SPA. After that, subsequent route navigation runs this code below
      // from the browser and get the new page props, which is this time rendered
      // directly in the browser, as opposed to the first page rendering.

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
