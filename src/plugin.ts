import type { Plugin } from 'vite'

const pluginName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export = function ViteSsrPlugin() {
  return {
    name: pluginName,
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
  } as Plugin
}
