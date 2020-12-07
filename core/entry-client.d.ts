declare module 'vite-ssr/entry-client' {
  import Vue, { App } from 'vue'
  import { RouteLocationRaw, Router } from 'vue-router'

  const handlerClient: (
    App: typeof Vue,
    options: { routes: RouteLocationRaw[]; base?: string },
    hook: (params: {
      app: App
      router: Router
      isClient: true
    }) => Promise<void>
  ) => Promise<void>

  export default handlerClient
}
