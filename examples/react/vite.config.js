const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const viteSSR = require('vite-ssr/plugin')
const api = require('../node-server/api')

module.exports = defineConfig({
  server: {
    fs: {
      // The API logic is in outside of the project
      strict: false,
    },
  },
  plugins: [
    viteSSR({
      features: {
        // Manually disable features that are
        // detected because this is a mono repo
        reactStyledComponents: false,
        reactApolloRenderer: false,
      },
    }),
    react(),
    {
      // Mock API during development
      configureServer({ middlewares }) {
        api.forEach(({ route, handler }) => middlewares.use(route, handler))
      },
    },
  ],
})
