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

    const { href } = new URL(request.url)
    router.push(href)

    await router.isReady()

    const initialState = JSON.stringify(
      router.currentRoute.value.meta.state || {}
    )

    const html = await renderer.renderToString(app)

    if (html && initialState) {
      return {
        // This string is replaced at build time.
        html: `__VITE_SSR_HTML__`,
      }
    }

    return { html: `` }
  }
}
