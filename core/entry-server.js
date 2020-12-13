import { createSSRApp } from 'vue'
import renderer from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

export default function (App, { routes, base }, hook) {
  return async function ({ request, ...extra }) {
    const url = new URL(
      (request.url.includes('://') ? '' : 'http://e.g') + request.url
    )

    const routeBase = base && base({ url })
    const router = createRouter({
      history: createMemoryHistory(routeBase),
      routes,
    })

    const app = createSSRApp(App)
    app.use(router)
    const fullPath = url.href.replace(url.origin, '')

    let initialRoutePath = fullPath
    if (routeBase && initialRoutePath.startsWith(routeBase)) {
      initialRoutePath = initialRoutePath.replace(routeBase.slice(1), '')
    }

    if (hook) {
      await hook({
        app,
        router,
        request,
        isClient: false,
        initialRoute: router.resolve(initialRoutePath),
        ...extra,
      })
    }

    router.push(fullPath)

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
