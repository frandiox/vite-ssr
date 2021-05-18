import App from './App'
import { routes } from './routes'
import viteSSR from 'vite-ssr'
import { InMemoryCache } from '@apollo/client'

export default viteSSR(
  App,
  {
    routes,
    transformState(state, defaultTransformer) {
      if (import.meta.env.SSR) {
        state.apolloCache = state.apolloCache.extract()
      }

      return defaultTransformer(state)
    },
  },
  ({ initialState }) => {
    // Custom initialization hook
    if (import.meta.env.SSR) {
      initialState.apolloCache = new InMemoryCache()
    } else {
      initialState.apolloCache = new InMemoryCache().restore(
        initialState.apolloCache
      )
    }
  }
)
