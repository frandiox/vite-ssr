const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue')
const viteSSR = require('vite-ssr/plugin')

// https://vitejs.dev/config/
module.exports = defineConfig({
  ssr: { format: 'cjs' },
  plugins: [viteSSR(), vue()],
})
