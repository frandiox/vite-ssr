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
    }) => Promise<void>
  ) => Promise<(url: string | URL) => Promise<{ html: string }>>

  export default handler
}
