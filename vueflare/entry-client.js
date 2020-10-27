import { createSSRApp } from 'vue'
import App from '../src/App.vue'
import createRouter from '../src/router'

export default async function (hook) {
  const app = createSSRApp(App)
  const router = createRouter('client')

  app.use(router)

  if (hook) {
    await hook({ app, router })
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
