import type { Plugin } from 'vite'
import type { ViteSsrPluginOptions } from './config'
import { createSSRDevHandler, SsrOptions } from './dev/server'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export = function ViteSsrPlugin(
  options: ViteSsrPluginOptions & SsrOptions = {}
) {
  return {
    name: pluginName,
    viteSsrOptions: options,
    config() {
      let isReact = false

      try {
        require.resolve('@vitejs/plugin-react-refresh')
        isReact = true
      } catch (error) {}

      const detectedFeats = {
        ...(isReact && detectReactConfigFeatures(options.features)),
      }

      return {
        ...detectedFeats,
        ssr: {
          ...detectedFeats.ssr,
          noExternal: [pluginName],
        },
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
        find: /^vite-ssr(\/vue|\/react)?$/,
        replacement:
          pluginName + lib + (config.build.ssr ? entryServer : entryClient),
        // @ts-ignore
        _viteSSR: true,
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

function detectReactConfigFeatures(
  features: ViteSsrPluginOptions['features'] = {}
) {
  const external = []
  let useApolloRenderer

  // TODO use virtual modules for feature-detection

  try {
    require.resolve('@apollo/client/react/ssr')
    useApolloRenderer = features.reactApolloRenderer !== false
  } catch (error) {
    external.push('@apollo/client')
  }

  return {
    ssr: { external },
    define: {
      __USE_APOLLO_RENDERER__: !!useApolloRenderer,
    },
  }
}
