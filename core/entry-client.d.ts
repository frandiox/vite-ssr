declare module 'vite-ssr/entry-client' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

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
    }) => Promise<void>
  ) => Promise<void>

  export default handlerClient
}
