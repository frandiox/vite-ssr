declare module 'vite-ssr/react/entry-server' {
  type Renderer = (
    url: string | URL,
    options?: {
      manifest?: Record<string, string[]>
      preload?: boolean
      [key: string]: any
    }
  ) => Promise<{ html: string; dependencies: string[] }>

  const handlerSSR: (
    App: any,
    options?: {
      routes?: Record<string, any>[]
      base?: (params: { url: URL }) => string
    },
    hook?: (params: {
      router: any
      isClient: false
      initialState: Record<string, any>
      [key: string]: any
    }) => Promise<void>
  ) => Promise<Renderer>

  export default handlerSSR
}
