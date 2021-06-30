import type { Plugin } from 'vite'
import { createSSRDevHandler, SsrOptions } from './dev/server'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

type ViteSsrPluginOptions = {
  features?: {
    /**
     * Use '@apollo/client' renderer if present
     * @default true
     */
    reactApolloRenderer?: boolean
    /**
     * Collect 'styled-components' styles if present
     * @default true
     */
    reactStyledComponents?: boolean
    /**
     * Collect '@material-ui/core' styles if present
     * @default true
     */
    reactMaterialUi?: boolean
  }
}

export = function ViteSsrPlugin(
  options: ViteSsrPluginOptions & SsrOptions = {}
) {
  return {
    name: pluginName,
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
        find: /^vite-ssr$/,
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
  let useStyledComponents
  let useMaterialUi

  // TODO use virtual modules for feature-detection

  try {
    require.resolve('@apollo/client/react/ssr')
    useApolloRenderer = features.reactApolloRenderer !== false
  } catch (error) {
    external.push('@apollo/client')
  }

  try {
    require.resolve('styled-components')
    useStyledComponents = features.reactStyledComponents !== false
  } catch (error) {
    external.push('styled-components')
  }

  try {
    require.resolve('@material-ui/core')
    useMaterialUi = features.reactMaterialUi !== false
  } catch (error) {
    external.push('@material-ui/core')
  }

  return {
    ssr: { external },
    define: {
      __USE_APOLLO_RENDERER__: !!useApolloRenderer,
      __USE_STYLED_COMPONENTS__: !!useStyledComponents,
      __USE_MATERIAL_UI__: !!useMaterialUi,
    },
  }
}
