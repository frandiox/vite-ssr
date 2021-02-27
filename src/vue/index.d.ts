declare module 'vite-ssr/vue' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
  import { Head } from '@vueuse/head'

  type HookResponse = void | {
    head?: Head
  }

  const handlerClient: (
    App: typeof Vue,
    options?: {
      routes?: RouteLocationRaw[]
      base?: (params: { url: URL }) => string
      debug?: { mount?: boolean }
    },
    hook?: (params: {
      app: App
      router: Router
      isClient: true
      initialRoute: RouteLocationNormalized
    }) => HookResponse | Promise<HookResponse>
  ) => Promise<void>

  export default handlerClient
  export const ClientOnly: typeof Vue
}
