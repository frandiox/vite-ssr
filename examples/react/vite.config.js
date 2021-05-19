const { defineConfig } = require('vite')
const reactRefresh = require('@vitejs/plugin-react-refresh')
const viteSSR = require('vite-ssr/plugin')
const api = require('../node-server/api')

module.exports = defineConfig({
  plugins: [
    viteSSR({
      features: {
        // Manually disable features that are
        // detected because this is a mono repo
        reactStyledComponents: false,
        reactApolloRenderer: false,
      },
    }),
    reactRefresh(),
    {
      // Mock API during development
      configureServer({ middlewares }) {
        api.forEach(({ route, handler }) => middlewares.use(route, handler))
      },
    },
  ],
})
