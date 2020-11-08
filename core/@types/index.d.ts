// TODO proper type for Vue Router routes when that package exports types (missing in rc.2)

type ViteSSROptions = { routes: any[] }

declare module 'vite-ssr' {
  const handler: (
    App: any,
    options: ViteSSROptions,
    hook: (params: {
      app: any
      router: any
      request?: Request
      isClient: boolean
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handler
}

declare module 'vite-ssr/entry-client' {
  const handler: (
    App: any,
    options: ViteSSROptions,
    hook: (params: { app: any; router: any; isClient: true }) => Promise<void>
  ) => Promise<void>

  export default handler
}

declare module 'vite-ssr/entry-server' {
  const handler: (
    App: any,
    options: ViteSSROptions,
    hook: (params: {
      app: any
      router: any
      request: Request
      isClient: false
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handler
}

declare module 'vite-ssr/build' {
  import { BuildConfig } from 'vite'
  const handler: (options: {
    clientOptions: BuildConfig
    ssrOptions: BuildConfig
  }) => Promise<void>

  export default handler
}
