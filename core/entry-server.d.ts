declare module 'vite-ssr/entry-server' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

  const handlerSSR: (
    App: typeof Vue,
    options: {
      routes: RouteLocationRaw[]
      base?: (params: { url: URL }) => string
    },
    hook: (params: {
      app: App
      router: Router
      request: Request
      isClient: false
      initialRoute: RouteLocationNormalized
      [key: string]: any
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handlerSSR
}
