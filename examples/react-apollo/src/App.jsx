import './App.css'
import React, { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import logo from './logo.svg'
import { ClientOnly } from 'vite-ssr'
import { ApolloClient, ApolloProvider, createHttpLink } from '@apollo/client'

export default function App({ isClient, url, router, apolloCache }) {
  const baseUrl = isClient ? '' : url.origin
  const [count, setCount] = useState(0)

  const client = new ApolloClient({
    link: createHttpLink({
      uri: `${baseUrl}/graphql`,
      credentials: 'same-origin',
    }),
    ssrMode: !isClient,
    cache: apolloCache,
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
        <Routes>
          {router.routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
        </Routes>

        <ClientOnly>
          <div>This text only renders in client side</div>
        </ClientOnly>
      </div>
    </ApolloProvider>
  )
}
