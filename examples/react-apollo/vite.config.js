const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const viteSSR = require('vite-ssr/plugin')
const api = require('../node-server/api')

module.exports = defineConfig({
  ssr: { format: 'cjs' },
  plugins: [
    viteSSR(),
    react(),
    {
      // Mock API during development
      configureServer({ middlewares }) {
        api.forEach(({ route, handler }) => middlewares.use(route, handler))
      },
    },
  ],
})
