declare module 'vite-ssr/build' {
  import { BuildConfig } from 'vite'

  const builder: (options: {
    clientOptions: BuildConfig
    ssrOptions: BuildConfig
  }) => Promise<void>

  export default builder
}
