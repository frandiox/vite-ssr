import { createApp } from 'vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import createClientContext from '../core/entry-client.js'
import { getFullPath, withoutSuffix } from '../utils/route'
import { addPagePropsGetterToRoutes } from './utils'
import type { ClientHandler, Context } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

export const viteSSR: ClientHandler = async function viteSSR(
  App,
  {
    routes,
    base,
    routerOptions = {},
    pageProps = { passToPage: true },
    debug = {},
    ...options
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
    ...routerOptions,
    history: createWebHistory(routeBase),
    routes: routes as RouteRecordRaw[],
  })

  const context: Context = await createClientContext({
    ...options,
    url,
    spaRedirect: (location) => router.push(location),
  })

  provideContext(app, context)

  let entryRoutePath: string | undefined
  let isFirstRoute = true
  router.beforeEach((to, from, next) => {
    if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false
      entryRoutePath = to.path
      to.meta.state = context.initialState
    }

    next()
  })

  if (hook) {
    await hook({
      app,
      router,
      initialRoute: router.resolve(getFullPath(url, routeBase)),
      ...context,
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
