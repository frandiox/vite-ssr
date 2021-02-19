declare module 'vite-ssr' {
  const handler: (
    App: any,
    options: {
      routes: Record<string, any>[]
      base?: (params: { url: URL }) => string
      debug?: { mount?: boolean }
    },
    hook?: (params: {
      app: any
      router: any
      request?: Request
      isClient: boolean
      initialRoute: any
      [key: string]: any
    }) => Promise<void>
  ) => Promise<() => Promise<{ html: string }>>

  export default handler
}
