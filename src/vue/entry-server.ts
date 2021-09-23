import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router'
import { createUrl, getFullPath, withoutSuffix } from '../utils/route'
import { addPagePropsGetterToRoutes } from './utils'
import { renderHeadToString } from '@vueuse/head'
import { runSsrRenderer } from '../core/entry-server.js'
import type { SsrHandler } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

export const viteSSR: SsrHandler = function viteSSR(
  App,
  {
    routes,
    base,
    routerOptions = {},
    pageProps = { passToPage: true },
    ...options
  },
  hook
) {
  if (pageProps && pageProps.passToPage) {
    addPagePropsGetterToRoutes(routes)
  }

  return async function (url, rendererOptions = {}) {
    const app = createSSRApp(App)

    url = createUrl(url)
    const routeBase = base && withoutSuffix(base({ url }), '/')
    const router = createRouter({
      ...routerOptions,
      history: createMemoryHistory(routeBase),
      routes: routes as RouteRecordRaw[],
    })

    return runSsrRenderer(
      url,
      options,
      rendererOptions,
      async (context, { isRedirect }) => {
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

        if (isRedirect()) return {}

        Object.assign(
          context.initialState || {},
          (router.currentRoute.value.meta || {}).state || {}
        )

        const body = await renderToString(app, context)

        if (isRedirect()) return {}

        let {
          headTags = '',
          htmlAttrs = '',
          bodyAttrs = '',
        } = head ? renderHeadToString(head) : {}

        return { body, headTags, htmlAttrs, bodyAttrs }
      }
    )
  }
}

export default viteSSR
