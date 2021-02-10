module.exports = () => ({
  name: 'vite-ssr',
  configResolved: (config) => {
    config.alias.push({
      find: /^vite-ssr$/,
      replacement: config.build.ssr
        ? 'vite-ssr/entry-server'
        : 'vite-ssr/entry-client',
    })
  },
})
