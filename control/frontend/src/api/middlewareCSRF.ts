import { useAuthStore } from '@/stores/auth'
import { type InternalAxiosRequestConfig } from 'axios'


const middlewareCSRF = async (axiosConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    
    const authStore = useAuthStore()
    if (!authStore.csrfToken) {
        console.log('Initializing CSRF token...')
        await authStore.initializeCsrfToken()
    }
    axiosConfig.headers['x-csrf-token'] = authStore.csrfToken
    
    return axiosConfig
}

export default middlewareCSRF