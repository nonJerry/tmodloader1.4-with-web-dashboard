<template>
	<form @submit.prevent="loginFn" class="wrapped-form">
		<label for="username">What may go here?</label>
		<input id="username" name="username" v-model.trim="credentials.username" type="text" autocomplete="username" required />

		<label for="password">The second riddle?</label>
		<input id="password" name="password" v-model.trim="credentials.password" type="password" autocomplete="current-password" required />

		<div class="to-end">
			<button type="submit">Mystery Function</button>
		</div>
	</form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const credentials = reactive({
	username: null,
	password: null
})

const loginFn = async () => {
	try {
		await auth.login(credentials)
	} catch (error) {
		console.log((error as Error).message)
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