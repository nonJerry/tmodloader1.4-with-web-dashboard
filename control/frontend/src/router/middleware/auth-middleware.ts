import { useAuthStore } from '@/stores/auth.ts'
import type { RouteLocation } from 'vue-router'

const middleware = (to: RouteLocation) => {
    const auth = useAuthStore()


    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return { name: 'login' }
    }

    if (to.name === 'login' && auth.isLoggedIn) {
        return { name: 'dashboard' }
    }

    return true
};
export default middleware;