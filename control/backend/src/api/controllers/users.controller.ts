import { Request, Response } from 'express';
import { verifyToken } from '../../services/jwt.service.js';
import users from '../../services/users.service.js';

export function getCurrentUser (req: Request, res: Response) {
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(401).json({ username: 'guest' });
        }

        try {
            const payload = verifyToken(token);
            const id = payload.username;

            if (!users[id]) {
                return res.status(401).json({ username: 'guest' });
            }

            return res.json({
                username: id,
            });
        } catch (ignoredError) {
            return res.status(401).json({ username: 'guest' });
        }
}

export default getCurrentUser