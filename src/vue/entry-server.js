import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { parseHTML, findDependencies, renderPreloadLinks } from '../utils/html'
import { renderHeadToString } from '@vueuse/head'
export { ClientOnly } from '../components.mjs'

export default function (App, { routes, base }, hook) {
  return async function (url, { manifest, preload = false, ...extra } = {}) {
    const app = createSSRApp(App)

    url = createUrl(url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const router = createRouter({
      history: createMemoryHistory(routeBase),
      routes,
    })

    app.use(router)

    // This can be injected with useSSRContext() in setup functions
    const context = {
      url,
      isClient: false,
      initialState: {},
      ...extra,
    }

    const fullPath = getFullPath(url, routeBase)

    const { head } =
      (hook &&
        (await hook({
          app,
          router,
          initialRoute: router.resolve(fullPath),
          ...context,
        }))) ||
      {}

    router.push(fullPath)

    await router.isReady()

    Object.assign(
      context.initialState || {},
      router.currentRoute.value.meta.state || {}
    )

    const rawAppHtml = await renderToString(app, context)

    // TODO: remove parseHTML when vueuse/head supports ld+json
    let {
      body = rawAppHtml,
      headTags = '',
      htmlAttrs = '',
      bodyAttrs = '',
    } = head ? renderHeadToString(head) : parseHTML(rawAppHtml)

    const dependencies = manifest
      ? findDependencies(context.modules, manifest)
      : []

    if (preload && dependencies.length > 0) {
      headTags += renderPreloadLinks(dependencies)
    }

    const initialState = JSON.stringify(context.initialState || {})

    return {
      // This string is replaced at build time
      // and injects all the previous variables.
      html: `__VITE_SSR_HTML__`,
      htmlAttrs,
      headTags,
      body,
      bodyAttrs,
      initialState,
      dependencies,
    }
  }
}
