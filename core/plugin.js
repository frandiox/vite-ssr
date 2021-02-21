const name = 'vite-ssr'

module.exports = () => ({
  name,
  configResolved: (config) => {
    let lib = '/vue' // default

    if (
      config.plugins.findIndex((plugin) => plugin.name === 'react-refresh') >= 0
    ) {
      lib = '/react'
    }

    const file = config.build.ssr ? '/entry-server' : '/entry-client'

    // config.alias is pre-beta.69
    ;(config.resolve.alias || config.alias).push({
      find: /^vite-ssr$/,
      replacement: name + lib + file,
    })
  },
})
