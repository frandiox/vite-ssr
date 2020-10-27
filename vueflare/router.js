import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'

export default function ({ routes, type }) {
  const routerHistory =
    type === 'client' ? createWebHistory() : createMemoryHistory()

  return createRouter({
    history: routerHistory,
    routes,
  })
}
