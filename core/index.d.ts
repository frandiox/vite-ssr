declare module 'vite-ssr' {
  import Vue, { App } from 'vue'
  import { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

  const handler: (
    App: typeof Vue,
    options: { routes: RouteLocationRaw[]; base?: string },
    hook: (params: {
      app: App
      router: Router
      request?: Request
      isClient: boolean
      initialRoute: RouteLocationNormalized
      [key: string]: any
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handler
}
