import type { Request, Response } from 'express'
import { COOKIE_PREFIX, IS_PRODUCTION } from "../../config/constants.js"
import bcrypt from 'bcrypt'
import users from '../../services/users.service.js'
import { createAccessToken, createToken } from '../../services/jwt.service.js'

export async function handleLogin (req: Request, res: Response) {
        const { username, password } = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'username and password required' })
        }

        const hashedPassword = users[username]
        if (!hashedPassword) {
            return res.status(401).json({ error: 'Invalid user' })
        }

        const valid = await bcrypt.compare(password, hashedPassword)
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' })
        }

        const jwtToken = createToken(username)
        const shortLivedJwtToken = createAccessToken(jwtToken, req.session.id)

        res.cookie(COOKIE_PREFIX + "-refreshToken", jwtToken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365
        })

        res.cookie(COOKIE_PREFIX + "-accessToken", shortLivedJwtToken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "lax",
            path: "/",
        })


        res.json({ success: true, message: "Login successful" })
}

export function handleLogout (req: Request, res: Response) {
        const removeCookie = (cookieName: string) => {
            res.clearCookie(cookieName, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                sameSite: "lax",
                path: "/",
            })
        }

        removeCookie(IS_PRODUCTION ? COOKIE_PREFIX + "-accessToken" : "accessToken");
        removeCookie(IS_PRODUCTION ? COOKIE_PREFIX + "-xsrf-token" : "xsrf-token");

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Logout failed');
            }
            removeCookie(IS_PRODUCTION ? COOKIE_PREFIX + "-sessionId" : "sessionId");

            res.json({ success: true, message: "Logged out successfully" })
        })
}