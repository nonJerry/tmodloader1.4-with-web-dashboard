import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Config', () => {

  beforeEach(() => {
    vi.resetModules()
  })

  it('provides fallback default values when no env vars are set', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('BASE_URL', '')
    vi.stubEnv('BASE_PATH', '')

    const { config, IS_PRODUCTION } = await import('../constants.js')

    expect(IS_PRODUCTION).toBe(true)
    expect(config.apiPort).toBe(8000)
    expect(config.allowedOrigins).toEqual(['http://localhost:5173'])
    expect(config.sessionSecret).toBe('assdafasdf')
    expect(config.csrfSecret).toBe('sdfgvsarg35g345')
    expect(config.redisHost).toBe('redis')
    expect(config.redisPort).toBe(6379)
    expect(config.redisUser).toBeUndefined()
    expect(config.redisPassword).toBeUndefined()
    expect(config.cookiePrefix).toBe('__Secure-terraria-control')
    expect(config.jwtSecret).toBe('terraria-control')
    expect(config.cookieSecret).toBe('allCookiesAreMine')
    expect(config.apiUrl).toBe(new URL('/cgi-bin/api', 'http://terraria:6002').toString())
    expect(config.isSessionBound).toBe(false)
    expect(config.accessTokenCookie).toBe('__Secure-terraria-control_access-token')
    expect(config.refreshTokenCookie).toBe('__Secure-terraria-control_refresh-token')
    expect(config.xsrfTokenCookie).toBe('__Secure-terraria-control_xsrf-token')
    expect(config.sessionIdCookie).toBe('__Secure-terraria-control_session-id')
  })

  it('uses env values', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('API_PORT', '9001')
    vi.stubEnv('ALLOWED_ORIGINS', 'https://example.com,https://another.com')
    vi.stubEnv('SESSION_SECRET', 'session-secret')
    vi.stubEnv('CSRF_SECRET', 'csrf-secret')
    vi.stubEnv('REDIS_HOST', 'redis-host')
    vi.stubEnv('REDIS_PORT', '6380')
    vi.stubEnv('REDIS_USER', 'redis-user')
    vi.stubEnv('REDIS_PASSWORD', 'redis-pass')
    vi.stubEnv('COOKIE_PREFIX', '__Secure-prod-test-terraria')
    vi.stubEnv('JWT_SECRET', 'jwt-secret')
    vi.stubEnv('COOKIE_SECRET', 'cookie-secret')
    vi.stubEnv('BASE_URL', 'https://api.example.com')
    vi.stubEnv('BASE_PATH', '/cgi/api')
    vi.stubEnv('SESSION_BOUND_TOKEN', 'true')

    const { config, IS_PRODUCTION } = await import('../constants.js')

    expect(IS_PRODUCTION).toBe(true)
    expect(config.apiPort).toBe(9001)
    expect(config.allowedOrigins).toEqual(['https://example.com', 'https://another.com'])
    expect(config.sessionSecret).toBe('session-secret')
    expect(config.csrfSecret).toBe('csrf-secret')
    expect(config.redisHost).toBe('redis-host')
    expect(config.redisPort).toBe(6380)
    expect(config.redisUser).toBe('redis-user')
    expect(config.redisPassword).toBe('redis-pass')
    expect(config.cookiePrefix).toBe('__Secure-prod-test-terraria')
    expect(config.jwtSecret).toBe('jwt-secret')
    expect(config.cookieSecret).toBe('cookie-secret')
    expect(config.apiUrl).toBe(new URL('/cgi/api', 'https://api.example.com').toString())
    expect(config.isSessionBound).toBe(true)
    expect(config.accessTokenCookie).toBe('__Secure-prod-test-terraria_access-token')
    expect(config.refreshTokenCookie).toBe('__Secure-prod-test-terraria_refresh-token')
    expect(config.xsrfTokenCookie).toBe('__Secure-prod-test-terraria_xsrf-token')
    expect(config.sessionIdCookie).toBe('__Secure-prod-test-terraria_session-id')
  })

  it('uses simple cookie names when not in production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { config } = await import('../constants.js')
    expect(config.accessTokenCookie).toBe('access-token')
    expect(config.refreshTokenCookie).toBe('refresh-token')
    expect(config.xsrfTokenCookie).toBe('xsrf-token')
    expect(config.sessionIdCookie).toBe('connect.sid')
  })

  it.each(['development', 'staging', 'test', 'unittest'])('does not use prod config if env is set to %s', async (env) => {
    vi.stubEnv('NODE_ENV', env)
    const { IS_PRODUCTION } = await import('../constants.js')
    expect(IS_PRODUCTION).toBe(false)
  })

  it.each(['production', 'prdouction', 'randomA', 'developmentAS', 'randomB', 'どうかな'])('uses prod config if env is set to %s', async (env) => {
    vi.stubEnv('NODE_ENV', env)
    const { IS_PRODUCTION } = await import('../constants.js')
    expect(IS_PRODUCTION).toBe(true)
  })
})
