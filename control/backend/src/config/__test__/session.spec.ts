import { RedisStore } from 'connect-redis'
import { RedisClient } from 'redis'
import { describe, it, expect, vi, beforeEach } from 'vitest'


async function captureSession(captured: { options?: Record<string, unknown> }) { // simple spy fails due to esm
  const actual = await vi.importActual<typeof import('express-session')>('express-session')
  vi.doMock('express-session', () => ({
    default: (options: Record<string, unknown>) => {
      captured.options = options
      //@ts-ignore
      return actual.default(options)
    },
  }))
}

describe('Session config', () => {

  beforeEach(() => {
    vi.resetModules()
  })

  it('uses default memory store when not in production and no redis user is set', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('REDIS_USER', '')
    const captured: { options?: Record<string, unknown> } = {}
    await captureSession(captured)

    const { default: session } = await import('../session.js')
    const config = (await import('../constants.js')).config

    expect(typeof session).toBe('function')
    expect(captured.options).toMatchObject({
      secret: expect.any(String),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: { secure: false, sameSite: "lax", signed: true, maxAge: 3.6e6 },
      name: config.sessionIdCookie
    }) // uses default if store is not set
  })

  it('configures redis store when in production and REDIS_USER is set', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('REDIS_USER', 'testuser')
    vi.stubEnv('REDIS_HOST', '127.0.0.1')
    vi.stubEnv('REDIS_PORT', '6379')
    vi.stubEnv('REDIS_PASSWORD', 'pass')
    vi.stubEnv('SESSION_SECRET', 'secret')
    const captured: { options?: Record<string, unknown> } = {}
    await captureSession(captured)

    vi.spyOn(RedisClient.prototype, 'connect').mockReturnThis() // Skip actual connection establishment

    const { default: session } = await import('../session.js')
    const config = (await import('../constants.js')).config

    expect(typeof session).toBe('function')
    expect(captured.options).toMatchObject({
      secret: expect.any(String),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: { secure: true, sameSite: "lax", signed: true, maxAge: 3.6e6 },
      name: config.sessionIdCookie,
      store: expect.any(RedisStore)
    })
  })
})
