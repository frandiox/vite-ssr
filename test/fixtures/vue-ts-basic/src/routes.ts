import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./pages/home.vue'),
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('./pages/about.vue'),
  },
  {
    name: 'repos',
    path: '/repos',
    component: () => import('./pages/repos.vue'),
  },
]

export default routes
