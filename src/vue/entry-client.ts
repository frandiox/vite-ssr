import { createApp } from 'vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getFullPath, withoutSuffix } from '../utils/route'
import { deserializeState } from '../utils/state'
import { addPagePropsGetterToRoutes } from './utils'
export { ClientOnly } from './components.js'
import type { ClientHandler } from './types'

export const viteSSR: ClientHandler = async function viteSSR(
  App,
  {
    routes,
    base,
    pageProps = { passToPage: true },
    debug = {},
    transformState = deserializeState,
  },
  hook
) {
  if (pageProps && pageProps.passToPage) {
    addPagePropsGetterToRoutes(routes)
  }

  const app = createApp(App)

  const url = window.location
  const routeBase = base && withoutSuffix(base({ url }), '/')
  const router = createRouter({
    history: createWebHistory(routeBase),
    routes: routes as RouteRecordRaw[],
  })

  const initialState = await transformState(
    // @ts-ignore
    window.__INITIAL_STATE__,
    deserializeState
  )

  let entryRoutePath: string | undefined
  let isFirstRoute = true
  router.beforeEach((to, from, next) => {
    if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false
      entryRoutePath = to.path
      to.meta.state = initialState
    }

    next()
  })

  if (hook) {
    await hook({
      url,
      app,
      router,
      isClient: true,
      initialState: initialState || {},
      initialRoute: router.resolve(getFullPath(url, routeBase)),
    })
  }

  app.use(router)

  if (debug.mount !== false) {
    // this will hydrate the app
    await router.isReady()
    app.mount('#app', true)
    // it is possible to debug differences of SSR / Hydrated app state
    // by adding a timeout between rendering the SSR version and hydrating it later
    // window.setTimeout(() => {
    //   console.log('The app has now hydrated');
    //   router.isReady().then(() => {
    //     app.mount('#app', true);
    //   });
    // }, 5000);
  }
}

export default viteSSR
