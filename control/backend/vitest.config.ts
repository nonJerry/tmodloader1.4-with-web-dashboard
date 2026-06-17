import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    env: {
      NODE_ENV: 'unittest',
      BASE_URL: 'http://localhost:8000',
      BASE_PATH: '/cgi-bin/api',
    },
  },
})
