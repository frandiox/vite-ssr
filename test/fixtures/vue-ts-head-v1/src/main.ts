import App from './App.vue'
import routes from './routes'
import ssrApp from 'vite-ssr/vue'
import { createHead } from '@vueuse/head'

export default ssrApp(App, { routes }, (context) => {
  //  data fetching`

  // Create basic head
  const head = createHead({
    title: 'vue-ts-head-v1-title',
  });

  context.app.use(head);

  return {
    head,
  }
})
