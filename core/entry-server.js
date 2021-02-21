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

    // This can be injected with useSSRContext() in setup functions
    const context = {
      url,
      isClient: false,
      initialState: {},
      ...extra,
    }

    if (hook) {
      await hook({
        app,
        router,
        initialRoute: router.resolve(fullPath),
        ...context,
      })
    }

    router.push(fullPath)

    await router.isReady()

    Object.assign(
      context.initialState || {},
      router.currentRoute.value.meta.state || {}
    )

    const rawAppHtml = await renderToString(app, context)

    // TODO: in Vite 2 is already possible to have some kind of `useHead` utility.
    // Replace this HTML parsing with a hook.
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
