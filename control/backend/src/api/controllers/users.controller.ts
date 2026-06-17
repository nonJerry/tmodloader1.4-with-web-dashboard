import { Request, Response } from 'express'
import { verifyToken } from '../../services/jwt.service.js'
import users from '../../services/users.service.js'
import { config } from '../../config/constants.js'

export function getCurrentUser(req: Request, res: Response) {
  const token = req.cookies?.[config.refreshTokenCookie]
  const username = getAuthenticatedUsername(token)

  if (!username) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  return res.json({ username })
}

function getAuthenticatedUsername(token?: string) {
  if (!token) {
    return undefined
  }

  try {
    const payload = verifyToken(token)
    const username = payload.username

    if (!username || !users[username]) {
      return undefined
    }

    return username
  } catch {
    return undefined
  }
}

export default getCurrentUser
