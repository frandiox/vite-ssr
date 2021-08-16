export default [
  {
    path: '/',
    component: () => import('./pages/Homepage.vue'),
    name: 'home',
  },
  {
    path: '/a',
    component: () => import('./pages/PageA.vue'),
    name: 'a',
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: () => import('./pages/404.vue'),
  },
]
