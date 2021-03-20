const name = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

module.exports = () => ({
  name,
  configResolved: (config) => {
    let lib = '/vue' // default

    if (
      config.plugins.findIndex((plugin) => plugin.name === 'react-refresh') >= 0
    ) {
      lib = '/react'
    }

    // config.alias is pre-beta.69
    ;(config.resolve.alias || config.alias).push({
      find: /^vite-ssr$/,
      replacement: name + lib + (config.build.ssr ? entryServer : entryClient),
    })

    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []
    config.optimizeDeps.include.push(
      name + lib + entryClient,
      name + lib + entryServer
    )
  },
})
