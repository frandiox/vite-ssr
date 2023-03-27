import App from './App.vue'
import routes from './routes'
import ssrApp from 'vite-ssr/vue'
import { createHead, HeadObject, HeadObjectPlain } from '@vueuse/head'

export default ssrApp(App, { routes }, (context) => {
  //  data fetching`

  // Create basic head
  const head = createHead();

  context.app.use(head);

  return {
    head,
  }
})
