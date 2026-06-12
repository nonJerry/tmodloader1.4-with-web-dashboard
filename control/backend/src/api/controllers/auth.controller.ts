import type { Request, Response } from 'express'
import { IS_PRODUCTION } from "../../config/constants.js"
import bcrypt from 'bcrypt'
import users from '../../services/users.service.js'
import { createAccessToken, createToken } from '../../services/jwt.service.js'

export const handleLogin = () => {
    return async (req: Request, res: Response) => {
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

        res.cookie("refreshToken", jwtToken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365
        })

        res.cookie("accessToken", shortLivedJwtToken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            sameSite: "lax",
            path: "/",
        })


        res.json({ success: true, message: "Login successful" })
    }
}

export const handleLogout = () => {
    return async (req: Request, res: Response) => {
        const removeCookie = (cookieName: string) => {
            res.clearCookie(cookieName, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                sameSite: "lax",
                path: "/",
            })
        }

        removeCookie("accessToken");
        removeCookie("xsrf-token");

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Logout failed');
            }
            removeCookie('connect.sid');

            res.json({ success: true, message: "Logged out successfully" })
        })

    }
}