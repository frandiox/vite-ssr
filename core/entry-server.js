import { createSSRApp } from 'vue'
import renderer from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

export default function (App, { routes, base }, hook) {
  return async function ({ request, ...extra }) {
    const router = createRouter({
      history: createMemoryHistory(base),
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

    const url = new URL(
      (request.url.includes('://') ? '' : 'http://e.c') + request.url
    )
    router.push(url.href.replace(url.origin, ''))

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
