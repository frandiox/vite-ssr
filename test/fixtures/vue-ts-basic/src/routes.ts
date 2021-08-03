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
]

export default routes
