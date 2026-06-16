import { doubleCsrf } from "csrf-csrf";
import { CSRF_SECRET, IS_PRODUCTION, COOKIE_PREFIX, XSRF_TOKEN_COOKIE } from "./constants.js";
import { verifyToken } from "../services/jwt.service.js";


export const { doubleCsrfProtection, invalidCsrfTokenError, generateCsrfToken } = doubleCsrf({
    getSecret: () => CSRF_SECRET,
    getSessionIdentifier: (req) => {
        const token = req.cookies?.accessToken;

        if (!token) return "";

        try {
            const payload = verifyToken(token);

            return payload.sessionId ?? payload.username;
        } catch {
            return "";
        }
    },
    cookieOptions: {
        sameSite: "lax",
        secure: IS_PRODUCTION,
        httpOnly: false
    },
    cookieName: XSRF_TOKEN_COOKIE
});