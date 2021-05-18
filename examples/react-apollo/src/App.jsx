import './App.css'
import React, { useState } from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import logo from './logo.svg'
import { ClientOnly } from 'vite-ssr'
import { ApolloClient, ApolloProvider, createHttpLink } from '@apollo/client'
export default function App({ isClient, url, router, initialState }) {
  const baseUrl = isClient ? '' : url.origin
  const [count, setCount] = useState(0)

  const client = new ApolloClient({
    link: createHttpLink({
      uri: `${baseUrl}/graphql`,
      credentials: 'same-origin',
    }),
    ssrMode: !isClient,
    cache: initialState.apolloCache,
    credentials: 'same-origin',
  })

  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Hello ViteSSR + React + Apollo!</p>
          <p>
            <button onClick={() => setCount((count) => count + 1)}>
              count is: {count}
            </button>
          </p>

          <nav>
            <ul>
              {router.routes.map(({ name, path }) => {
                return (
                  <li key={path}>
                    <Link to={path}>{name}</Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </header>
        <Switch>
          {router.routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              component={route.component}
            />
          ))}
        </Switch>

        <ClientOnly>
          <div>This text only renders in client side</div>
        </ClientOnly>
      </div>
    </ApolloProvider>
  )
}
