declare module 'vite-ssr/entry-server' {
  import Vue, { App } from 'vue'
  import { RouteLocationRaw, Router } from 'vue-router'

  const handlerSSR: (
    App: typeof Vue,
    options: { routes: RouteLocationRaw[]; base?: string },
    hook: (params: {
      app: App
      router: Router
      request: Request
      isClient: false
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handlerSSR
}
