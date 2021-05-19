import type { Plugin } from 'vite'
import { createSSRDevHandler, SsrOptions } from './dev/server'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export = function ViteSsrPlugin(options: SsrOptions = {}) {
  return {
    name: pluginName,
    config() {
      let isReact = false

      try {
        require.resolve('@vitejs/plugin-react-refresh')
        isReact = true
      } catch (error) {}

      return {
        ...(isReact && detectReactConfigFeatures()),
      }
    },
    configResolved: (config) => {
      let lib = '/vue' // default

      if (
        config.plugins.findIndex((plugin) => plugin.name === 'react-refresh') >=
        0
      ) {
        lib = '/react'
      }

      config.resolve.alias.push({
        find: /^vite-ssr$/,
        replacement:
          pluginName + lib + (config.build.ssr ? entryServer : entryClient),
      })

      // @ts-ignore
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        pluginName + lib + entryClient,
        pluginName + lib + entryServer
      )
    },
    async configureServer(server) {
      if (process.env.__DEV_MODE_SSR) {
        const handler = createSSRDevHandler(server, options)
        return () => server.middlewares.use(handler)
      }
    },
  } as Plugin
}

function detectReactConfigFeatures() {
  const external = []
  let useApolloRenderer
  let useStyledComponents

  try {
    require.resolve('@apollo/client/react/ssr')
    useApolloRenderer = true
  } catch (error) {
    external.push('@apollo/client')
  }

  try {
    require.resolve('styled-components')
    useStyledComponents = true
  } catch (error) {
    external.push('styled-components')
  }

  return {
    ssr: { external },
    define: {
      __USE_APOLLO_RENDERER__: !!useApolloRenderer,
      __USE_STYLED_COMPONENTS__: !!useStyledComponents,
    },
  }
}
