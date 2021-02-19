import './App.css'
import React, { useState } from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import { routes } from './routes'
import logo from './logo.svg'
import { getPageProps } from './api'

// Simple wrapper that provides props to the pages
// before rendering. This could be done in each page separately.
let isFirstRoute = true
function PropsProvider({ route, context }) {
  console.log('Rendering ', route.name, context.initialState)

  // Prevent rerrendering
  route.props =
    isFirstRoute && !import.meta.env.DEV
      ? context.initialState
      : route.props || getPageProps({ ...route, ...context })

  isFirstRoute = false

  return route.props ? (
    <route.component {...route.props} />
  ) : (
    <div>Loading...</div>
  )
}

export default function App(context) {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello ViteSSR + React!</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            count is: {count}
          </button>
        </p>

        <nav>
          <ul>
            {routes.map(({ name, path }) => {
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
        {routes.map((route) => {
          return (
            <Route key={route.path} path={route.path}>
              <PropsProvider route={route} context={context} />
            </Route>
          )
        })}
      </Switch>
    </div>
  )
}
