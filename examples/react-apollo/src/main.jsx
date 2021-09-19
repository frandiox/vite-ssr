import App from './App'
import { routes } from './routes'
import viteSSR from 'vite-ssr'
import { InMemoryCache } from '@apollo/client'

export default viteSSR(App, { routes }, (context) => {
  // Create a new Apollo cache (once per request)
  // and make it available in the App function context
  const cache = new InMemoryCache()
  context.apolloCache = cache

  // Sync initialState and Apollo cache
  if (import.meta.env.SSR) {
    // Placeholder for the SSR state
    context.initialState.apolloState = { toJSON: () => cache.extract() }
  } else {
    // Use existing state in browser
    cache.restore(context.initialState.apolloState)
  }
})
