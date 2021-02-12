const { defineConfig } = require('vite')
const viteSSR = require('vite-ssr/plugin')
const vue = require('@vitejs/plugin-vue')
const api = require('./node-server/api')

module.exports = defineConfig({
  plugins: [
    viteSSR(),
    vue(),
    {
      // Mock API during development
      configureServer({ middlewares }) {
        api.forEach(({ route, handler }) => middlewares.use(route, handler))
      },
    },
  ],
})
