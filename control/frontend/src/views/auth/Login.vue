<template>
	<form @submit.prevent="loginFn" class="wrapped-form">
		<label for="id">What may go here?</label>
		<input id="id" name="userid" v-model.trim="credentials.id" type="text" required />

		<label for="password">The second riddle?</label>
		<input id="password" name="passwd" v-model.trim="credentials.password" type="password" required />

		<div class="to-end">
			<button type="submit">Mystery Function</button>
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