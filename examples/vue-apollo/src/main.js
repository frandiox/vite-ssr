import './index.css'
import App from './App.vue'
import routes from './routes'
import viteSSR from 'vite-ssr'
import { provideApolloClient } from '@vue/apollo-composable'

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client/core'

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
  ({ app, router, isClient, url, initialState, initialRoute, request }) => {
    // Cache implementation
    if (import.meta.env.SSR) {
      initialState.apolloCache = new InMemoryCache()
    } else {
      initialState.apolloCache = new InMemoryCache().restore(
        initialState.apolloCache
      )
    }

    // Create and provide the apollo client
    provideApolloClient(
      new ApolloClient({
        link: createHttpLink({
          uri: `${isClient ? '' : url.origin}/graphql`,
          credentials: 'same-origin',
        }),
        cache: initialState.apolloCache,
      })
    )
  }
)
