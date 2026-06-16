import { createRouter, createWebHistory } from 'vue-router'
import authMiddleware from './middleware/auth-middleware'

import Dashboard from '@/views/DashboardView.vue'
import Login from '@/views/auth/LoginView.vue'
import About from '@/views/AboutView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'dashboard', path: '/', meta: { requiresAuth: true }, component: Dashboard },
    { name: 'login', path: '/login', component: Login, meta: { layout: 'auth' } },
    { name: 'about', path: '/about', meta: { requiresAuth: true }, component: About },
  ]
})

router.beforeEach(authMiddleware)

export default router
