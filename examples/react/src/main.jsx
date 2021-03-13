import App from './App'
import { routes } from './routes'
import viteSSR from 'vite-ssr'

export default viteSSR(App, { routes }, ({ url, isClient }) => {
  // Custom initialization hook
})
