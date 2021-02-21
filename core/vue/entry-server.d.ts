declare module 'vite-ssr/vue/entry-server' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

  type Renderer = (
    url: string | URL,
    options?: {
      manifest?: Record<string, string[]>
      preload?: boolean
      [key: string]: any
    }
  ) => Promise<{ html: string; dependencies: string[] }>

  const handlerSSR: (
    App: typeof Vue,
    options?: {
      routes?: RouteLocationRaw[]
      base?: (params: { url: URL }) => string
    },
    hook?: (params: {
      app: App
      router: Router
      isClient: false
      initialState: any
      initialRoute: RouteLocationNormalized
      [key: string]: any
    }) => Promise<void>
  ) => Promise<Renderer>

  export default handlerSSR
}
