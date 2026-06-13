import { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

/**
 * Middleware - if user lost authentication (401) it gets kicked out
 * FROM https://youtu.be/BWNcuB3LQz8?t=1119
 */
const middleware401 = async (error: AxiosError): Promise<never> => {
    const status = error.response?.status
    const authStore = useAuthStore()
    if (status === 401 || status === 419) {
        if (authStore.isLoggedIn) {
            setTimeout(async () => await authStore.logout(router), 3000)
            const rejectionError = new Error('You lost your credentials - will be redirected to login page.')
            rejectionError.name = 'PermissionDenied'
            throw rejectionError;
        }
    } else if (status === 403) {
        const rejectionError = new Error('You are not authorized to access this resource.')
        rejectionError.name = 'PermissionDenied'
         await authStore.initializeCsrfToken()
        throw rejectionError;
    }

    // Propagate all other errors
    throw error;
}

export default middleware401