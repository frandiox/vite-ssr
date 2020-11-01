import { createSSRApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

export default async function (App, { routes }, hook) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  const app = createSSRApp(App)
  app.use(router)

  if (hook) {
    await hook({ app, router, isClient: true, baseUrl: '' })
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
