import './index.css'
import App from './App.vue'
import routes from './routes'
import viteSSR from 'vite-ssr'

export default viteSSR(App, { routes }, ({ app, router }) => {
  console.log('bootstrap')
})
