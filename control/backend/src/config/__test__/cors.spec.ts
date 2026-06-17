import { describe, it, expect, vi, beforeEach } from 'vitest'

async function captureCors(captured: { options?: Record<string, unknown> }) {
  const actual = await vi.importActual<typeof import('cors')>('cors')
  vi.doMock('cors', () => ({
    default: (options: Record<string, unknown>) => {
      captured.options = options
      //@ts-ignore
      return actual.default(options)
    },
  }))
}

describe('CORS config', () => {

  beforeEach(() => {
    vi.resetModules()
  })

  it('respects set allowed origins from environment', async () => {
    const captured: { options?: Record<string, unknown> } = {}
    await captureCors(captured)

    vi.stubEnv('ALLOWED_ORIGINS', 'http://example.test')

    const corsConfig = (await import('../cors.js')).default
    expect(typeof corsConfig).toBe('function')
    expect(captured.options).toEqual({
      origin: ['http://example.test'],
      credentials: true,
    })
  })

  it('uses default origin if nothing is set', async () => {
    const captured: { options?: Record<string, unknown> } = {}
    await captureCors(captured)

    const corsConfig = (await import('../cors.js')).default
    const config = (await import('../constants.js')).config
    expect(typeof corsConfig).toBe('function')
    expect(captured.options).toEqual({
      origin: config.allowedOrigins,
      credentials: true,
    })
  })
})
