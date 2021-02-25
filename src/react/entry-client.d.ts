declare module 'vite-ssr/react/entry-client' {
  const handlerClient: (
    App: any,
    options?: {
      routes?: Record<string, any>[]
      base?: (params: { url: URL }) => string
      debug?: { mount?: boolean }
    },
    hook?: (params: {
      router: any
      isClient: true
      initialState: Record<string, any>
    }) => Promise<void>
  ) => Promise<void>

  export default handlerClient
}
