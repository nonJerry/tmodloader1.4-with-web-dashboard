import type { Request, Response } from 'express'
import { config, IS_PRODUCTION } from "../../config/constants.js"
import bcrypt from 'bcrypt'
import users from '../../services/users.service.js'
import { createAccessToken, createToken } from '../../services/jwt.service.js'


export async function handleLogin(req: Request, res: Response) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' })
  }

  const hashedPassword = users[username]
  if (!await isValidPassword(password, hashedPassword)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const refreshToken = createToken(username)
  const accessToken = createAccessToken(refreshToken, req.session.id)

  setLoginCookies(res, refreshToken, accessToken)

  return res.json({ success: true, message: 'Login successful' })
}

export function handleLogout(req: Request, res: Response) {
  clearCookie(res, config.refreshTokenCookie)
  clearCookie(res, config.accessTokenCookie)
  clearCookie(res, config.xsrfTokenCookie)

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err)
      return res.status(500).send('Logout failed')
    }

    clearCookie(res, config.sessionIdCookie)
    return res.json({ success: true, message: 'Logged out successfully' })
  })
}

async function isValidPassword(password: string, hashedPassword?: string) {
  if (!hashedPassword) {
    return false
  }

  return bcrypt.compare(password, hashedPassword)
}

function setLoginCookies(res: Response, refreshToken: string, accessToken: string) {
  res.cookie(config.refreshTokenCookie, refreshToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  })

  res.cookie(config.accessTokenCookie, accessToken, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
  })
}

function clearCookie(res: Response, cookieName: string) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
  })
}
