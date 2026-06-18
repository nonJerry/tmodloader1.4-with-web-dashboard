import { describe, expect, it, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import * as authService from '../auth.service.js'
import * as jwtService from '../jwt.service.js'
import { config } from '../../config/constants.js'

vi.mock('../jwt.service.js')


describe('Auth service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('verifies token and returns payload', () => {
    const mockPayload = { username: 'alice', sessionId: 'session-1' }
    vi.mocked(jwtService.verifyToken).mockReturnValue(mockPayload as any)

    const result = authService.authenticateAccessToken('token-abc', 'session-1')
    expect(result).toEqual(mockPayload)
    expect(jwtService.verifyToken).toHaveBeenCalledWith('token-abc')
  })

  it('throws an error if accessToken does not match session if session-bound tokens are enabled', async () => {
    // @ts-ignore
    config.isSessionBound = true
    const jwtService = await import('../jwt.service.js')

    vi.mocked(jwtService.verifyToken).mockReturnValue({ username: 'alice', sessionId: 'session-old' } as any)

    expect(() => authService.authenticateAccessToken('token-abc', 'session-new'))
      .toThrow('Invalid session-bound token')
  })

  it('throws an error if token verification fails', () => {
    vi.mocked(jwtService.verifyToken).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token')
    })

    expect(() =>
      authService.authenticateAccessToken('token-bad', 'session-1')
    ).toThrow('Invalid token')
  })

  it('creates new access token from refresh token', () => {
    const mockNewToken = 'new-access-token'
    vi.mocked(jwtService.createAccessToken).mockReturnValue(mockNewToken)

    const result = authService.refreshAccessToken('refresh-token-xyz', 'session-2')
    expect(result).toBe(mockNewToken)
    expect(jwtService.createAccessToken).toHaveBeenCalledWith('refresh-token-xyz', 'session-2')
  })

  it('returns true for TokenExpiredError', () => {
    const error = new jwt.TokenExpiredError('Token expired', new Date())
    expect(authService.isTokenExpiredError(error)).toBe(true)
  })

  it('does not handle other errors like expired', () => {
    const error = new jwt.JsonWebTokenError('Invalid token')
    expect(authService.isTokenExpiredError(error)).toBe(false)
    expect(authService.isTokenExpiredError(new Error('Generic error'))).toBe(false)
    expect(authService.isTokenExpiredError('string error')).toBe(false)
    expect(authService.isTokenExpiredError(null)).toBe(false)
  })
})
