import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'

type ServerHook = (params: {
  app: any;
  router: any;
  request: Request;
  isClient: false;
}) => Promise<void>;

export default function (App: any, { routes }: ViteSSROptions, hook: ServerHook) {
  return async function ({ request, ...extra }: { request: Request }) {
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

    const initialState = JSON.stringify(
      router.currentRoute.value.meta.state || {}
    )

    const html = await renderToString(app)

    if (html && initialState) {
      return {
        // This string is replaced at build time.
        html: `__VITE_SSR_HTML__`,
      }
    }

    return { html: `` }
  }
}
