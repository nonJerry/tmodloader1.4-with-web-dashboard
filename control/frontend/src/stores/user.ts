import { defineStore } from 'pinia'
import { useApi } from '@/api/useAPI'

export interface UserState {
	id: number | null,
	name: string
}

function getStoredUser(): UserState {
	const stored = localStorage.getItem('USER_INFO')
	if (!stored) return { id: null, name: 'guest' }

	try {
		const parsed = JSON.parse(stored)
		return {
			id: parsed.id ?? null,
			name: parsed.name ?? 'guest'
		}
	} catch {
		return { id: null, name: 'guest' }
	}
}

const api = useApi()

export const useUserStore = defineStore('user', {
	state: (): UserState => getStoredUser(),

	actions: {
		updateState(payload: Partial<UserState>) {
			let newUserState = { ...this.$state, ...payload }
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