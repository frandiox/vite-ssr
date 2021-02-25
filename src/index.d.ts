// This is a generic mix of framework types

declare module 'vite-ssr' {
  const handler: (
    App: any,
    options: {
      routes: Record<string, any>[]
      base?: (params: { url: URL }) => string
      debug?: { mount?: boolean }
    },
    hook?: (params: {
      url: URL
      app: any
      router: any
      isClient: boolean
      initialState: any
      initialRoute: any
      [key: string]: any
    }) => any
  ) => any

  export default handler
}
