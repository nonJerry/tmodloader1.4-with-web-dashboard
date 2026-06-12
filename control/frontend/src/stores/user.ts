import { defineStore } from 'pinia'
import { useApi } from '@/api/useAPI'

export interface UserState {
	username: string,
	isAuthenticated: boolean;
}

function getStoredUser(): UserState {
	const stored = localStorage.getItem('USER_INFO')
	if (!stored) return { username: 'guest', isAuthenticated: false }

	try {
		const parsed = JSON.parse(stored)
		return {
			username: parsed.username ?? 'guest',
			isAuthenticated: parsed.isAuthenticated ?? false
		}
	} catch {
		return { username: 'guest', isAuthenticated: false }
	}
}

const api = useApi()

export const useUserStore = defineStore('user', {
	state: (): UserState => getStoredUser(),

	actions: {
		updateState(payload: Partial<UserState>) {
			const newUserState = { ...this.$state, ...payload }
			localStorage.removeItem('USER_INFO')
			localStorage.setItem('USER_INFO', JSON.stringify(newUserState))
			this.$reset() // maybe $patch
		},

		async storeInfo() {
			const { data: userInfo } = await api.get<UserState>('/user')
			localStorage.setItem('USER_INFO', JSON.stringify(userInfo))
			this.$reset() // maybe $patch
		},
	},
})