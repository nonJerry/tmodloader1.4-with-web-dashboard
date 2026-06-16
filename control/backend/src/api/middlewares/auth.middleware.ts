import { Request, Response, NextFunction } from 'express';
import { ACCESS_TOKEN_COOKIE, IS_PRODUCTION, REFRESH_TOKEN_COOKIE } from '../../config/constants.js';
import { authenticateAccessToken, refreshAccessToken, isTokenExpiredError } from '../../services/auth.service.js'


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE]
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE]
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
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        path: '/',
    })
}

function unauthorized(res: Response, message: string) {
    return res.status(401).json({ error: message })
}