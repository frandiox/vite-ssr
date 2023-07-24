const { defineConfig } = require('vite')
const viteSSR = require('vite-ssr/plugin')
const vue = require('@vitejs/plugin-vue')
const api = require('../node-server/api')
const UnheadVite = require('@unhead/addons/vite')

module.exports = defineConfig({
  server: {
    fs: {
      // The API logic is in outside of the project
      strict: false,
    },
  },
  ssr: { format: 'cjs' },
  plugins: [
    viteSSR(),
    UnheadVite(),
    vue(),
    {
      // Mock API during development
      configureServer({ middlewares }) {
        api.forEach(({ route, handler }) => middlewares.use(route, handler))
      },
    },
  ],
})
