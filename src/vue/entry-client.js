import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { getFullPath, withoutSuffix } from '../utils/route'
import { addPagePropsGetterToRoutes } from './utils'
export { ClientOnly } from './components.js'

export default async function (
  App,
  {
    routes,
    base,
    pageProps = { passToPage: true },
    debug = {},
    transformState = (state) => state,
  } = {},
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
    routes,
  })

  app.use(router)

  const initialState = await transformState(window.__INITIAL_STATE__)

  let entryRouteName
  let isFirstRoute = true
  router.beforeEach((to, from, next) => {
    if (isFirstRoute || (entryRouteName && entryRouteName === to.name)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false
      entryRouteName = to.name
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

  if (debug.mount !== false) {
    // this will hydrate the app
    await router.isReady()
    app.mount('#app', true)
  }
}

// it is possible to debug differences of SSR / Hydrated app state
// by adding a timeout between rendering the SSR version and hydrating it later
// window.setTimeout(() => {
//   console.log('The app has now hydrated');
//   router.isReady().then(() => {
//     app.mount('#app', true);
//   });
// }, 5000);
