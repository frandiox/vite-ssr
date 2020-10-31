import './index.css'
import App from './App.vue'
import routes from './routes'
import vueflare from '@vueflare'

export default vueflare(App, { routes }, ({ app, router }) => {
  console.log('bootstrap')
})
