import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory } from 'vue-router'
import {
  createUrl,
  parseHTML,
  getFullPath,
  withoutSuffix,
  findDependencies,
  renderPreloadLinks,
} from './utils'

export default function (App, { routes, base }, hook) {
  return async function (url, { manifest, preload = false, ...extra } = {}) {
    url = createUrl(url)

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
        url,
        app,
        router,
        isClient: false,
        initialRoute: router.resolve(fullPath),
        ...extra,
      })
    }

    router.push(fullPath)

    await router.isReady()

    // This can be injected with useSSRContext() in setup functions
    const context = {
      url,
      ...extra,
      initialState: router.currentRoute.value.meta.state || {},
    }

    const rawAppHtml = await renderToString(app, context)

    let { body, htmlAttrs, head, bodyAttrs } = parseHTML(rawAppHtml)

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
      htmlAttrs,
      head,
      body,
      bodyAttrs,
      initialState,
      dependencies,
    }
  }
}
