declare module 'vitedge/plugin' {
  import { Plugin } from 'vite'

  const plugin: () => Plugin
  export default plugin
}

declare module 'vitedge/plugin.js' {
  import { Plugin } from 'vite'

  const plugin: () => Plugin
  export default plugin
}
