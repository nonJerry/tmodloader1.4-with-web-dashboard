import { defineStore } from 'pinia'
import { useApi } from '@/api/useAPI'

export interface UserState {
	username: string,
	isAuthenticated: boolean;
}

const api = useApi()

export const useUserStore = defineStore('user', {
	state: (): UserState => ({
		username: 'guest',
		isAuthenticated: false
	}),

	actions: {
		updateState(payload: Partial<UserState>) {
			const newUserState = { ...this.$state, ...payload }
			localStorage.removeItem('USER_INFO')
			localStorage.setItem('USER_INFO', JSON.stringify(newUserState))
			this.$reset()
		},

		async storeInfo() {
			const { data: userInfo } = await api.get<UserState>('/me')
			localStorage.setItem('USER_INFO', JSON.stringify(userInfo))
			this.$reset()
		},
	},
})