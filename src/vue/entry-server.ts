import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { findDependencies, renderPreloadLinks } from '../utils/html'
import { useResponseSSR } from '../utils/response'
import { serializeState } from '../utils/state'
import { addPagePropsGetterToRoutes } from './utils'
import { renderHeadToString } from '@vueuse/head'
import type { SsrHandler, Context } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

export const viteSSR: SsrHandler = function viteSSR(
  App,
  {
    routes,
    base,
    routerOptions = {},
    pageProps = { passToPage: true },
    transformState = serializeState,
  },
  hook
) {
  if (pageProps && pageProps.passToPage) {
    addPagePropsGetterToRoutes(routes)
  }

  return async function (url, { manifest, preload = false, ...extra } = {}) {
    const app = createSSRApp(App)

    url = createUrl(url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const router = createRouter({
      ...routerOptions,
      history: createMemoryHistory(routeBase),
      routes: routes as RouteRecordRaw[],
    })

    const { deferred, response, writeResponse, isRedirect } = useResponseSSR()

    // This can be injected with useSSRContext() in setup functions
    const context = {
      url,
      isClient: false,
      initialState: {},
      writeResponse,
      ...extra,
    } as Context

    provideContext(app, context)

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

    app.use(router)
    router.push(fullPath)

    await router.isReady()

    if (isRedirect()) return response

    Object.assign(
      context.initialState || {},
      (router.currentRoute.value.meta || {}).state || {}
    )

    renderToString(app, context).then(deferred.resolve).catch(deferred.reject)
    const body = await deferred.promise

    if (isRedirect()) return response

    let {
      headTags = '',
      htmlAttrs = '',
      bodyAttrs = '',
    } = head ? renderHeadToString(head) : {}

    const dependencies = manifest
      ? // @ts-ignore
        findDependencies(context.modules, manifest)
      : []

    if (preload && dependencies.length > 0) {
      headTags += renderPreloadLinks(dependencies)
    }

    const initialState = await transformState(
      context.initialState || {},
      serializeState
    )

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
      ...(response || {}),
    }
  }
}

export default viteSSR
