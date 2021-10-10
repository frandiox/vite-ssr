import type { Plugin } from 'vite'
import type { ViteSsrPluginOptions } from './config'
import type { SsrOptions } from './dev/server'
import { createSSRDevHandler } from './dev/server'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

let lib: 'core' | 'vue' | 'react'

export = function ViteSsrPlugin(
  options: ViteSsrPluginOptions & SsrOptions = {}
) {
  return {
    name: pluginName,
    viteSsrOptions: options,
    config(config) {
      const plugins = config.plugins as Plugin[]
      const isVue = hasPlugin(plugins, 'vite:vue')
      const isReact =
        hasPlugin(plugins, 'vite:react') || hasPlugin(plugins, 'react-refresh')

      lib = isVue ? 'vue' : isReact ? 'react' : 'core'

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
      const libPath = `/${lib}`

      config.resolve.alias.push({
        find: /^vite-ssr(\/core|\/vue|\/react)?$/,
        replacement:
          pluginName + libPath + (config.build.ssr ? entryServer : entryClient),
        // @ts-ignore
        _viteSSR: true,
      })

      // @ts-ignore
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        pluginName + libPath + entryClient,
        pluginName + libPath + entryServer
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

function hasPlugin(plugins: Plugin[] | Plugin[][] = [], name: string): boolean {
  return !!plugins.flat().find((plugin) => (plugin.name || '').startsWith(name))
}

function hasDependency(dependency: string) {
  try {
    require.resolve(dependency)
    return true
  } catch (error) {
    return false
  }
}

function detectReactConfigFeatures(
  features: ViteSsrPluginOptions['features'] = {}
) {
  const external = []
  let useApolloRenderer

  // TODO use virtual modules for feature-detection

  if (hasDependency('@apollo/client/react/ssr')) {
    useApolloRenderer = features.reactApolloRenderer !== false
  } else {
    external.push('@apollo/client')
  }

  return {
    ssr: { external },
    define: {
      __USE_APOLLO_RENDERER__: !!useApolloRenderer,
    },
  }
}
