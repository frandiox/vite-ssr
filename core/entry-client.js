import { createSSRApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

export default async function (App, { routes, base }, hook) {
  const routeBase = base && base({ url: window.location })
  const router = createRouter({
    history: createWebHistory(routeBase),
    routes,
  })

  const app = createSSRApp(App)
  app.use(router)

  let entryRouteName
  let isFirstRoute = true
  router.beforeEach((to, from, next) => {
    if (isFirstRoute || (entryRouteName && entryRouteName === to.name)) {
      // The first route is rendered in the server and its state is provided globally.
      isFirstRoute = false
      entryRouteName = to.name
      to.meta.state = window.__INITIAL_STATE__ || {}
    }

    next()
  })

  let initialRoutePath = window.location.href.replace(
    window.location.origin,
    ''
  )

  if (routeBase && initialRoutePath.startsWith(routeBase)) {
    initialRoutePath = initialRoutePath.replace(routeBase.slice(1), '')
  }

  if (hook) {
    await hook({
      app,
      router,
      isClient: true,
      baseUrl: '',
      initialState: window.__INITIAL_STATE__ || {},
      initialRoute: router.resolve(initialRoutePath),
    })
  }

  // this will hydrate the app
  await router.isReady()
  app.mount('#app', true)
}

// it is possible to debug differences of SSR / Hydrated app state
// by adding a timeout between rendering the SSR version and hydrating it later
// window.setTimeout(() => {
//   console.log('The app has now hydrated');
//   router.isReady().then(() => {
//     app.mount('#app', true);
//   });
// }, 5000);
