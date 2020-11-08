import { createSSRApp } from 'vue'
import renderer from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

export default function (App, { routes }, hook) {
  return async function ({ request, ...extra }) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    const app = createSSRApp(App)
    app.use(router)

    if (hook) {
      await hook({
        app,
        router,
        request,
        isClient: false,
        ...extra,
      })
    }

    router.push(request.url)

    await router.isReady()

    const initialState = router.currentRoute.value.meta.state || {}

    const html = await renderer.renderToString(app)

    if (html) {
      return {
        // This string is replaced at build time.
        html: `__VITE_SSR_HTML__<script>window.__INITIAL_STATE__=${JSON.stringify(
          initialState
        )}</script>`,
      }
    }

    return { html: `` }
  }
}
