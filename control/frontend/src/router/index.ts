import { createRouter, createWebHistory } from 'vue-router'
import authMiddleware from './middleware/auth-middleware'

import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/auth/Login.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'dashboard', path: '/', meta: { requiresAuth: true }, component: Dashboard },
    { name: 'login', path: '/login', component: Login, meta: { layout: 'auth' } },
  ]
})

router.beforeEach(authMiddleware)

export default router
