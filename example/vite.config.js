const viteSSRPlugin = require('vite-ssr/plugin')

module.exports = {
  plugins: [viteSSRPlugin],
  proxy: {
    '/api': {
      // This is the server in `node-site` directory
      target: 'http://localhost:8080',
    },
  },
}
