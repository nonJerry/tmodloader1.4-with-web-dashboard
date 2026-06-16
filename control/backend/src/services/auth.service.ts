import jwt from 'jsonwebtoken'
import { createAccessToken, verifyToken } from './jwt.service.js'
import { SESSION_BOUND_TOKEN } from '../config/constants.js'

export function authenticateAccessToken(accessToken: string, sessionId: string) {
  const payload = verifyToken(accessToken)

  if (SESSION_BOUND_TOKEN && payload.sessionId !== sessionId) {
    throw new jwt.JsonWebTokenError('Invalid session-bound token')
  }

  return payload
}

export function refreshAccessToken(refreshToken: string, sessionId: string) {
  return createAccessToken(refreshToken, sessionId)
}

export function isTokenExpiredError(error: unknown) {
  return error instanceof jwt.TokenExpiredError
}