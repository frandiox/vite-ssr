const viteSSR = require('vite-ssr/plugin')
const vue = require('@vitejs/plugin-vue')

module.exports = {
  plugins: [viteSSR(), vue()],
  server: {
    proxy: {
      '/api': {
        // This is the server in `node-site` directory
        target: 'http://localhost:8080',
      },
    },
  },
}
