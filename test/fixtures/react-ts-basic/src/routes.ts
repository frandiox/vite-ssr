import React from 'react'

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
const pages = import.meta.glob('./pages/*.tsx')

// Follow `react-router-config` route structure
export default Object.keys(pages).map((path) => {
  const name = (path.match(/\.\/pages\/(.*)\.[jt]sx$/)?.[1] || '').toLowerCase()
  let component: any = null

  return {
    name,
    path: name === 'home' ? '/' : `/${name.toLowerCase()}`,
    exact: true,
    // Async components
    component: (props: any) => {
      if (!component) {
        // Suspense will re-render when component is ready
        throw pages[path]().then((result) => {
          component = result.default
        })
      }

      return React.createElement(component, props)
    },
  }
})
