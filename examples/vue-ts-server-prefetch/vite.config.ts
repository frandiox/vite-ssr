import { defineConfig } from 'vite'
import viteSSR from 'vite-ssr/plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [viteSSR(), vue()],
})
