import React from 'react'

function getPageProps({ baseUrl, name, path } = {}) {
  // Get our page props from our custom API:
  return fetch(
    `${baseUrl}/api/getProps?path=${encodeURIComponent(
      path
    )}&name=${name}&client=${typeof window !== 'undefined'}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json())
}

export function PropsProvider({ baseUrl, route, children: Page }) {
  if (!route.meta.state || Object.keys(route.meta.state).length === 0) {
    const promise = getPageProps({ baseUrl, ...route }).then((state) => {
      route.meta.state = state
    })

    // Will be suspended until resolved
    throw promise
  }

  return <Page {...route.meta.state} />
}
