import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createUrl, getFullPath, withoutSuffix } from './utils'

export default function (App, { routes, base }, hook) {
  return async function ({ request, ...extra }) {
    const url = createUrl(request.url)

    const routeBase = base && withoutSuffix(base({ url }), '/')
    const router = createRouter({
      history: createMemoryHistory(routeBase),
      routes,
    })

    const app = createSSRApp(App)
    app.use(router)

    const fullPath = getFullPath(url, routeBase)

    if (hook) {
      await hook({
        app,
        router,
        request,
        isClient: false,
        initialRoute: router.resolve(fullPath),
        ...extra,
      })
    }

    router.push(fullPath)

    await router.isReady()

    const initialState = JSON.stringify(
      router.currentRoute.value.meta.state || {}
    )

    let html = await renderToString(app)

    const [helmet = ''] = html.match(/<html[^>]*?>(.|\s)*?<\/html>/im) || []
    let [, head = ''] = helmet.match(/<head[^>]*?>((.|\s)*?)<\/head>/im) || []
    let [, bodyAttrs = ''] = helmet.match(/<body([^>]*?)>/im) || []
    let [, htmlAttrs = ''] = helmet.match(/<html([^>]*?)>/im) || []

    if (helmet) {
      const viteDataAttribute = /\sdata-v-[\d\w]+/gm
      head = head.replace(viteDataAttribute, '')
      bodyAttrs = bodyAttrs.replace(viteDataAttribute, '')
      htmlAttrs = htmlAttrs.replace(viteDataAttribute, '')
      html = html.replace(helmet, '<!---->')
    }

    if (html && initialState) {
      return {
        // This string is replaced at build time.
        html: `__VITE_SSR_HTML__`,
      }
    }

    return { html: `` }
  }
}
