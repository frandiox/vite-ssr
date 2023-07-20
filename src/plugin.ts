import type { Plugin, UserConfig } from 'vite'
import type { ViteSsrPluginOptions } from './config'
import type { SsrOptions } from './dev/server'
import { createSSRDevHandler } from './dev/server'
import { normalizePath } from 'vite'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export = function ViteSsrPlugin(
  options: ViteSsrPluginOptions & SsrOptions = {}
) {
  let detectedLib: 'core' | 'vue'
  const nameToMatch = options.plugin || pluginName
  const autoEntryRE = new RegExp(`${nameToMatch}(\/core|\/vue)?$`)

  const plugins = [
    {
      name: pluginName,
      enforce: 'pre',
      viteSsrOptions: options,
      config(config, env) {
        const plugins = config.plugins as Plugin[]
        const isVue = hasPlugin(plugins, 'vite:vue')

        detectedLib = isVue ? 'vue' : 'core'

        return {
          define: {
            __CONTAINER_ID__: JSON.stringify(options.containerId || 'app'),
            // Vite 2.6.0 bug: use this
            // instead of import.meta.env.DEV
            __DEV__: env.mode !== 'production',
          },
          ssr: {
            noExternal: [pluginName],
          },
          server:
            // Avoid displaying 'localhost' in terminal in MacOS:
            // https://github.com/vitejs/vite/issues/5605
            process.platform === 'darwin'
              ? {
                  host: config.server?.host || '127.0.0.1',
                }
              : undefined,
        }
      },
      configResolved: (config) => {
        const libPath = `/${detectedLib}`

        // @ts-ignore
        config.optimizeDeps = config.optimizeDeps || {}
        config.optimizeDeps.include = config.optimizeDeps.include || []
        config.optimizeDeps.include.push(
          nameToMatch + libPath + entryClient,
          nameToMatch + libPath + entryServer
        )
      },
      async configureServer(server) {
        if (process.env.__DEV_MODE_SSR) {
          const handler = createSSRDevHandler(server, options)
          return () => server.middlewares.use(handler)
        }
      },

      // Implement auto-entry using virtual modules:
      resolveId(source, importer, options) {
        if (source.includes(nameToMatch)) {
          source = normalizePath(source)
          if (autoEntryRE.test(source)) {
            return `virtual:${source}/index.js`
          }
        }
      },
      load(id, options) {
        if (id.startsWith(`virtual:${nameToMatch}`)) {
          id = normalizePath(id)
          let [, lib = ''] = id.split('/')
          if (lib === 'index.js') {
            lib = detectedLib
          }

          const libPath = `'${nameToMatch}/${lib}/entry-${
            options?.ssr ? 'server' : 'client'
          }'`

          return `export * from ${libPath}; export { default } from ${libPath}`
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
            `${pluginName}/${detectedLib}/ssr-component-mock`,
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
