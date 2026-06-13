import { defineStore } from 'pinia'
// import router from '@/router'
import { type Router } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { getCsrfToken, useApi } from '@/api/useAPI'
const web = useApi('web')


export interface AuthState {
    isLoggedIn: boolean,
    csrfToken: string;
}


export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,
        csrfToken: '',
    }),

    actions: {
        async initAuth() {
            await useApi('api').get('/me').then(() => {
                console.log('User is logged in')
                this.updateState({ isLoggedIn: true })
            }).catch(() => {
                // Not logged in
            })
        },

        async initializeCsrfToken() {
            try {
                const res = await getCsrfToken();
                if ("csrfToken" in res.data) {
                    this.updateState({ csrfToken: res.data.csrfToken })
                } else {
                    console.error('Failed to initialize CSRF token');
                }
            } catch (ignoredError) {
                console.error('Failed to initialize CSRF token');
            }
        },

        updateState(payload: Partial<AuthState>) {
            this.$patch(payload)

            localStorage.setItem(
                'AUTH_STATE',
                JSON.stringify(this.$state)
            )
        },
        async login({ username, password }: { username: string; password: string }) {
            const user = useUserStore()
            try {
                await web.post('/login', { username, password })
                this.updateState({ isLoggedIn: true })
                this.initializeCsrfToken()
                await user.storeInfo()
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error at login:', error)
                } else {
                    console.error('Unknown error:', error)
                }
                throw error
            }
        },

        async logout(router: Router) {
            const user = useUserStore()
            localStorage.clear() // always clean localStorage before reset the state
            this.$reset()
            user.$reset()

            try {
                await web.post('/logout')
                await router.push({ name: 'login' })
            } catch (error) {
                globalThis.location.pathname = '/login'
                console.error('Unknown error:', error)
            }
        },
    },
})