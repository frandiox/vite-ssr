import App from './App.vue'
import routes from './routes'
import ssrApp from 'vite-ssr/vue'

export default ssrApp(App, { routes }, (context) => {
  //  data fetching`
})
