const name = 'vite-ssr'

module.exports = () => ({
  name,
  configResolved: (config) => {
    let path = name

    if (
      config.plugins.findIndex((plugin) => plugin.name === 'react-refresh') >= 0
    ) {
      path += '/react'
    }

    ;(config.resolve.alias || config.alias).push({
      find: /^vite-ssr$/,
      replacement:
        path + (config.build.ssr ? `/entry-server` : `/entry-client`),
    })
  },
})
