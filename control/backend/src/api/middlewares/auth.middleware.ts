import { Request, Response, NextFunction } from 'express';
import { COOKIE_PREFIX, IS_PRODUCTION } from '../../config/constants.js';
import { authenticateAccessToken, refreshAccessToken, isTokenExpiredError } from '../../services/auth.service.js'

const accessTokenCookie = IS_PRODUCTION ? `${COOKIE_PREFIX}-accessToken` : 'accessToken'
const refreshTokenCookie = IS_PRODUCTION ? `${COOKIE_PREFIX}-refreshToken` : 'refreshToken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.[accessTokenCookie]
    const refreshToken = req.cookies?.[refreshTokenCookie]
    const sessionId = req.session?.id

    if (!sessionId) {
        return unauthorized(res, 'Session required')
    }

    if (!accessToken) {
        const newAccessToken = getNewAccessToken(refreshToken, sessionId)
        if (!newAccessToken) return unauthorized(res, 'Missing or invalid refresh token')
        setAccessTokenCookie(res, newAccessToken)
        return next()
    }

    try {
        authenticateAccessToken(accessToken, sessionId)
        return next()
    } catch (error) {
        if (!isTokenExpiredError(error)) {
            console.error('Authentication failed:', error)
            return unauthorized(res, 'Invalid or expired token')
        }

        const newAccessToken = getNewAccessToken(refreshToken, sessionId)
        if (!newAccessToken) return unauthorized(res, 'Missing or invalid refresh token')
        setAccessTokenCookie(res, newAccessToken)
        return next()
    }
}

function getNewAccessToken(refreshToken: string | undefined, sessionId: string) {
    if (!refreshToken) return undefined

    try {
        return refreshAccessToken(refreshToken, sessionId)
    } catch (error) {
        console.error('Refresh token failed:', error)
        return undefined
    }
}

function setAccessTokenCookie(res: Response, token: string) {
    res.cookie(accessTokenCookie, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
    })
}

function unauthorized(res: Response, message: string) {
    return res.status(401).json({ error: message })
}