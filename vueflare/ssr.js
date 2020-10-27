import { createSSRApp } from 'vue'
import renderer from '@vue/server-renderer'
import App from '../src/App.vue'
import createRouter from '../src/router'

export const handler = async function ({ url }) {
  const router = createRouter()
  const app = createSSRApp(App)
  app.use(router)
  router.push(url)
  await router.isReady()
  return renderer.renderToString(app)
}
