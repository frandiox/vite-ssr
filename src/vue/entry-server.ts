import { createApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router'
import { getFullPath, withoutSuffix } from '../utils/route'
import { addPagePropsGetterToRoutes } from './utils'
import { renderHeadToString as renderHeadToStringOriginal } from '@vueuse/head'
import coreViteSSR from '../core/entry-server.js'
import type { SsrHandler } from './types'

import { provideContext } from './components.js'
export { ClientOnly, useContext } from './components.js'

type RenderHeadToStringOptions = Parameters<typeof renderHeadToStringOriginal>;
type RenderHeadToStringReturnType = ReturnType<typeof renderHeadToStringOriginal>;
type PromisifiedRenderHeadToString = (...args: RenderHeadToStringOptions) => Promise<RenderHeadToStringReturnType> | RenderHeadToStringReturnType;

// Wrap the renderHeadToString in a Promise to ensure compatibility with both versions ^0.6.0 and ^1.0.0 of @vueuse/head
const renderHeadToString: PromisifiedRenderHeadToString = (...args) => Promise.resolve(renderHeadToStringOriginal(...args));

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

  return coreViteSSR(options, async (context, { isRedirect, ...extra }) => {
    const app = createApp(App)

    const routeBase = base && withoutSuffix(base(context), '/')
    const router = createRouter({
      ...routerOptions,
      history: createMemoryHistory(routeBase),
      routes: routes as RouteRecordRaw[],
    })

    router.beforeEach((to) => {
      to.meta.state = extra.initialState || null
    })

    provideContext(app, context)

    const fullPath = getFullPath(context.url, routeBase)

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

    const {
      headTags = '',
      htmlAttrs = '',
      bodyAttrs = '',
    } = head ? await renderHeadToString(head) : {}

    return { body, headTags, htmlAttrs, bodyAttrs }
  })
}

export default viteSSR
