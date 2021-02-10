declare module 'vite-ssr/build' {
  import { InlineConfig } from 'vite'

  const builder: (options: {
    clientOptions: InlineConfig
    serverOptions: InlineConfig & { packageJson: Record<string, unknown> }
  }) => Promise<void>

  export default builder
}
