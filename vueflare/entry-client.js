import { createSSRApp } from 'vue'
import App from '../src/App.vue'
import createRouter from '../src/router'
import setupApp from '../src/main'

const router = createRouter('client')

const app = createSSRApp(App)
app.use(router)
;(async () => {
  await setupApp({ app })

  // this will hydrate the app
  await router.isReady()
  app.mount('#app', true)
})()

// it is possible to debug differences of SSR / Hydrated app state
// by adding a timeout between rendering the SSR version and hydrating it later
// window.setTimeout(() => {
//   console.log('The app has now hydrated');
//   router.isReady().then(() => {
//     app.mount('#app', true);
//   });
// }, 5000);
