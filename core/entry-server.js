import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import {
  createUrl,
  getFullPath,
  withoutSuffix,
  findDependencies,
  renderPreloadLinks,
} from './utils'

export default function (App, { routes, base }, hook) {
  return async function ({ request, manifest, preload = false, ...extra }) {
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

    // This can be injected with useSSRContext() in setup functions
    const context = {
      request,
      ...extra,
      initialState: router.currentRoute.value.meta.state || {},
    }

    let html = await renderToString(app, context)

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

    const dependencies = manifest
      ? findDependencies(context.modules, manifest)
      : []
    if (preload && dependencies.length > 0) {
      head += renderPreloadLinks(dependencies)
    }

    const initialState = JSON.stringify(context.initialState || {})

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      dependencies,
    }
  }
}
