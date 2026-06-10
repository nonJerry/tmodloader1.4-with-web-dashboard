<template>
	<form @submit.prevent="loginFn" class="wrapped-form">
		<label for="secret">Secret Secret</label>
		<input
			id="secret"
			name="secret"
			v-model.trim="credentials.secret"
			type="password"
			required />

		<div class="to-end">
			<button type="submit">Login</button>
		</div>
	</form>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const credentials = reactive({
	secret: null,
})

const loginFn = async () => {
	try {
		await auth.login(credentials)
	} catch (error) { 
		console.log(error.message) 
	}
	await router.push('/')
}
</script>

<style lang="scss" scoped>
.wrapped-form {
	display: flex;
	flex-direction: column;
	gap: 0.5em;
}
</style>