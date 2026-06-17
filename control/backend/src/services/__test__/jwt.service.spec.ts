import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createAccessToken, createToken, verifyToken } from '../jwt.service.js'

vi.mock('../config/constants.js', async () => ({
  JWT_SECRET: 'test-secret',
}))

describe('JWT service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates and verifies a token', async () => {
    const token = createToken('alice', 'session-1', '1h')
    const payload = verifyToken(token)
    expect(payload.username).toBe('alice')
    expect(payload.sessionId).toBe('session-1')
    expect(payload.aud).toBe('challengers')
    expect(payload.iss).toBe('terraria-control')
  })

  it('creates an access token from a refresh token', async () => {
    const refreshToken = createToken('bob', 'session-2', '1h')
    const accessToken = createAccessToken(refreshToken, 'session-2')
    const payload = verifyToken(accessToken)
    expect(payload.username).toBe('bob')
    expect(payload.sessionId).toBe('session-2')
  })

  it('throws for invalid tokens', async () => {
    expect(() => verifyToken('not-a-token')).toThrow()
  })
})
