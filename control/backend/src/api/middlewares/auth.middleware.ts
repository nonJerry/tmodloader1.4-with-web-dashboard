import { Request, Response, NextFunction } from 'express';
import { createAccessToken, verifyToken } from '../../services/jwt.service.js';
import jwt from 'jsonwebtoken';
import { IS_PRODUCTION, SESSION_BOUND_TOKEN } from '../../config/constants.js';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies?.accessToken;


    try {
        if (!accessToken) {
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                throw new jwt.TokenExpiredError('Invalid or expired token', new Date());
            } else {
                console.log('No access token cookie found');
                return res.status(401).json({ error: 'Missing access token cookie' });
            }
        }
        const payload = verifyToken(accessToken);

        if (SESSION_BOUND_TOKEN && payload.sessionId !== req.session.id) {
            throw new jwt.JsonWebTokenError('Session invalid or expired');
        }
        console.log(`Authentication successful for ${req.session.id}`);
        next()
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.log(`Token expired for ${req.session.id}, trying to refresh`);
            refreshAccessToken()
        } else {
            console.log(`Failed authentication for ${req.session.id}: ${err}`)
            return res.status(401).json({ error: 'Invalid or expired token' })
        }
    }

    function refreshAccessToken() {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Missing refresh token' });
        }

        try {
            const newAccessToken = createAccessToken(refreshToken, req.session.id);
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                sameSite: "lax",
                path: "/",
            })
            console.log(`Access token refreshed successfully for ${req.session.id}`);
            next();
        } catch (ignoredError) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
}
