import './index.css'
import App from './App.vue'
import routes from './route'
import viteSSR, { ClientOnly } from 'vite-ssr'
import { createHead } from '@vueuse/head'

export default viteSSR(
  App,
  { routes },
  ({ app, router, isClient, url, initialState, initialRoute, request }) => {
    const head = createHead()
    app.use(head)

    app.component(ClientOnly.name, ClientOnly)

    // The 'initialState' is hydrated in the browser and can be used to
    // pass it to Vuex, for example, if you prefer to rely on stores rather than page props.
    // In the server, 'initialState' is an empty object that can be mutated. It can be
    // passed to Vuex, or provide it to child components (see Homepage for an example).
    app.provide('initialState', initialState)

    router.beforeEach(async (to: any, from: any, next: any) => {
      if (!!to.meta.state) {
        return next()
      }

      try {
        const res: Response = await fetch(
          'https://jsonplaceholder.typicode.com/users'
        )
        to.meta.state = (await res.json()) as any
      } catch (error) {
        console.error(error)
        // redirect to error route
      }

      next()
    })

    return { head }
  }
)
