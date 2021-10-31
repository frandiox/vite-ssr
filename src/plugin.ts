import type { Plugin, UserConfig } from 'vite'
import type { ViteSsrPluginOptions } from './config'
import type { SsrOptions } from './dev/server'
import { createSSRDevHandler } from './dev/server'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export = function ViteSsrPlugin(
  options: ViteSsrPluginOptions & SsrOptions = {}
) {
  let lib: 'core' | 'vue' | 'react'

  const plugins = [
    {
      name: pluginName,
      viteSsrOptions: options,
      config(config, env) {
        const plugins = config.plugins as Plugin[]
        const isVue = hasPlugin(plugins, 'vite:vue')
        const isReact =
          hasPlugin(plugins, 'vite:react') ||
          hasPlugin(plugins, 'react-refresh')

        lib = isVue ? 'vue' : isReact ? 'react' : 'core'

        const detectedFeats = {
          ...(isReact && detectReactConfigFeatures(options.features)),
        }

        return {
          ...detectedFeats,
          define: {
            ...detectedFeats.define,
            // Vite 2.6.0 bug: use this
            // instead of import.meta.env.DEV
            __DEV__: env.mode !== 'production',
          },
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
            pluginName +
            libPath +
            (config.build.ssr ? entryServer : entryClient),
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

        if (lib === 'react') {
          fixReactDeps(config, libPath)
        }
      },
      async configureServer(server) {
        if (process.env.__DEV_MODE_SSR) {
          const handler = createSSRDevHandler(server, options)
          return () => server.middlewares.use(handler)
        }
      },
    },
  ] as Array<Plugin & Record<string, any>>

  if ((options.excludeSsrComponents || []).length > 0) {
    plugins.push({
      name: pluginName + '-exclude-components',
      enforce: 'pre',
      resolveId(source, importer, ...rest) {
        // @ts-ignore
        const ssr = rest[1] || rest[0]?.ssr // API changed in Vite 2.7 https://github.com/vitejs/vite/pull/5294

        if (
          ssr &&
          options.excludeSsrComponents!.some((re) => re.test(source))
        ) {
          return this.resolve(
            `${pluginName}/${lib}/ssr-component-mock`,
            importer,
            { skipSelf: true }
          )
        }
      },
    })
  }

  return plugins
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

// FIXME
// Vite 2.6.0 introduced a bug where `import.meta` is not populated
// correctly in optimized dependencies. At the same time, all the
// subdependencies in Style Collectors must be optimized.
function fixReactDeps(
  config: Pick<UserConfig, 'optimizeDeps' | 'root'>,
  libPath: string
) {
  const styleCollectorDeps = {
    'styled-components': ['styled-components'],
    'material-ui-core-v4': ['@material-ui/core/styles'],
    emotion: ['@emotion/cache', '@emotion/react'],
  } as const

  const styleCollectors = Object.keys(styleCollectorDeps).filter((sc) => {
    try {
      require.resolve(sc)
      return true
    } catch (error) {
      return false
    }
  })

  if (config.optimizeDeps) {
    config.optimizeDeps.include?.push(
      ...styleCollectors.flatMap(
        (sc) => styleCollectorDeps[sc as keyof typeof styleCollectorDeps]
      )
    )

    config.optimizeDeps.exclude = config.optimizeDeps.exclude || []
    config.optimizeDeps.exclude.push(
      ...styleCollectors.map(
        (sc) => pluginName + libPath + '/style-collectors/' + sc
      )
    )
  }
}
