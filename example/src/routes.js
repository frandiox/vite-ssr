export default [
  {
    path: '/',
    component: () => import('./pages/Homepage.vue'),
    props: true,
  },
  {
    path: '/a',
    component: () => import('./pages/PageA.vue'),
    props: true,
  },
  {
    path: '/b',
    component: () => import('./pages/PageB.vue'),
    props: true,
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    props: true,
    component: () => import('./pages/404.vue'),
  },
]
