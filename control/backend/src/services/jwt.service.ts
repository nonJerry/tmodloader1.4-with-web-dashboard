import jwt from 'jsonwebtoken'
import { config } from '../config/constants.js'


const JWT_OPTIONS = {
  issuer: 'terraria-control',
  audience: 'challengers',
}

export interface AuthPayload {
  username: string,
  sessionId: string | undefined,
  aud?: string,
  iss?: string
}

export const createToken = (username: string, sessionId: string | undefined = undefined, expiresIn: string = '1y', extraOptions: any = {}): string => {
  return jwt.sign(
    { username, sessionId },
    config.jwtSecret,
    {
      ...JWT_OPTIONS,
      expiresIn: expiresIn,
      ...extraOptions
    }
  )
}

export const createAccessToken = (refreshToken: string, sessionId: string) => {
  try {
    const payload = verifyToken(refreshToken)
    return createToken(payload.username, sessionId, '1h')
  } catch (err) {
    console.error('Invalid refresh token:', err)
    throw err
  }
}

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(
    token,
    config.jwtSecret,
    JWT_OPTIONS
  ) as AuthPayload
}
