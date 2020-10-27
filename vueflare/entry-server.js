import { createSSRApp } from 'vue'
import renderer from '@vue/server-renderer'
import createRouter from './router'

export default function (App, { routes }, hook) {
  return async function ({ url }) {
    const router = createRouter({ type: 'server', routes })
    const app = createSSRApp(App)
    app.use(router)

    router.push(url)

    if (hook) {
      await hook({ app, router })
    }

    await router.isReady()

    return renderer.renderToString(app)
  }
}
