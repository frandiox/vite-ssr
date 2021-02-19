declare module 'vite-ssr/entry-server' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

  type Renderer = (params: {
    request: Request
    manifest?: Record<string, string[]>
    preload?: boolean
    [key: string]: any
  }) => Promise<{ html: string; dependencies: string[] }>

  const handlerSSR: (
    App: typeof Vue,
    options?: {
      routes?: RouteLocationRaw[]
      base?: (params: { url: URL }) => string
    },
    hook?: (params: {
      app: App
      router: Router
      request: Request
      isClient: false
      initialRoute: RouteLocationNormalized
      [key: string]: any
    }) => Promise<void>
  ) => Promise<Renderer>

  export default handlerSSR
}
