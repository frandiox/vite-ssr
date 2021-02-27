declare module 'vite-ssr/vue/entry-server' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'
  import { Head } from '@vueuse/head'

  type Renderer = (
    url: string | URL,
    options?: {
      manifest?: Record<string, string[]>
      preload?: boolean
      [key: string]: any
    }
  ) => Promise<{ html: string; dependencies: string[] }>

  type HookResponse = void | {
    head?: Head
  }

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
    }) => HookResponse | Promise<HookResponse>
  ) => Promise<Renderer>

  export default handlerSSR
  export const ClientOnly: typeof Vue
}
