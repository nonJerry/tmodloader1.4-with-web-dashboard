import { defineStore } from 'pinia'
// import router from '@/router'
import { type Router } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useApi } from '@/api/useAPI'
const web = useApi('web')


export interface AuthState {
    username: string
    isLoggedIn: boolean
}


export const useAuthStore = defineStore('auth', {
    state: () => {
        const stored = localStorage.getItem('AUTH_STATE')

        return stored
            ? JSON.parse(stored)
            : {
                username: 'guest',
                isLoggedIn: false,
            }
    },

    actions: {
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
                this.updateState({ username: username, isLoggedIn: true })
                await user.storeInfo()
            } catch (error) {
                if (error instanceof Error) {
                    console.log('Error at login:', error)
                } else {
                    console.log('Unknown error:', error)
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
                console.log('Unknown error:', error)
            }
        },
    },
})