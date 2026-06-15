<template>
  <main class="container">
    <h1>Terraria Server Control</h1>

    <section class="status-card">
      <h2 v-if="players != 'STOPPED'">Players Online</h2>
      <div class="player-count">
        {{ players }}
      </div>
    </section>

    <section class="button-grid">
      <button v-for="command in commands" :key="command" @click="sendCommand(command)" :disabled="isDisabled(command)">
        {{ command }}
      </button>
    </section>

    <p v-if="message" class="message">
      {{ message }}
    </p>
  </main>
</template>

<script setup lang="ts">
import { useApi } from '@/api/useAPI'
import { onMounted, onUnmounted, ref } from 'vue'

const api = useApi('api')
const players = ref<string>('0')
const message = ref<string>('')
const buttonsDisabled = ref<boolean>(false)

const commands = [
  'start',
  'stop',
  'dawn',
  'noon',
  'dusk',
  'midnight',
  'save',
]

async function getStatus(): Promise<void> {
  try {
    const response = await api.get('/status', { responseType: "text" })
    const text = response.data
    players.value = text.trim()
  } catch (error) {
    console.log(error)
    players.value = '0'
  } finally {
    buttonsDisabled.value = false // buttons only disabled if server is stopped
  }
}

async function sendCommand(command: string): Promise<void> {
  buttonsDisabled.value = true
  try {
    await api.post(`/${command}`, {});
    message.value = `${command} command sent`

    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (error) {
    console.log(error)
    message.value = `Failed to send ${command}`
    buttonsDisabled.value = false // avoid having to reload on error
  }
}

function isDisabled(command: string): boolean {
  if (buttonsDisabled.value) return true;

  if (players.value === 'STOPPED') {
    return command !== 'start';
  }

  if (isNumber(players.value)) {
    return command === 'start';;
  }

  return true;
}

function isNumber(value?: string | number): boolean {
  return ((value != null) &&
    (value !== '') &&
    !Number.isNaN(Number(value.toString())));
}

let intervalId: ReturnType<typeof setInterval>;

onMounted(() => {
  getStatus()

  intervalId = globalThis.setInterval(() => {
    getStatus()
  }, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
}

.status-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.player-count {
  font-size: 5rem;
  font-weight: bold;
  margin-top: 1rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

button {
  padding: 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.message {
  margin-top: 1rem;
  color: green;
}
</style>
