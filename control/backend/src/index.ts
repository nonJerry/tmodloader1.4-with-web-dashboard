
import express from 'express';
import type { Request, Response, NextFunction } from 'express'
import helmet from "helmet";
import bcrypt from 'bcrypt'
import fs from 'node:fs'
import jwt from 'jsonwebtoken'


const app = express();
app.disable("x-powered-by");


app.use(express.json());
app.use(helmet());

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const BASE_URL = process.env.BASE_URL || 'http://terraria:6002'
const BASE_PATH = process.env.BASE_PATH || '/cgi-bin/api'
const API_URL = new URL(BASE_PATH, BASE_URL).toString()
const JWT_SECRET = process.env.JWT_SECRET || 'terraria-control'

const DEFAULT_SECRET_PATHS = [
    process.env.USERS_FILE_PATH,
    '/run/secrets/users'
].filter((p): p is string => typeof p === 'string') // remove not set env vars

const usersFilePath = DEFAULT_SECRET_PATHS.find(fs.existsSync) || '../../example.users.json'

const users = JSON.parse(
    fs.readFileSync(usersFilePath, 'utf8')
)
console.log('Loaded users:', Object.keys(users))

let currenStatus = '0';

async function checkStatus() {
    const u = new URL(API_URL);

    console.log({
        href: u.href,
        hostname: u.hostname,
        port: u.port,
        portType: typeof u.port,
    });
    
    const response = await fetch(`${API_URL}/status`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    const text = await response.text()

    if (text.trim() === 'STOPPED') {
        currenStatus = 'STOPPED'
    } else {
        currenStatus = Number(text) ? text : '0'
    }
    console.log(`Current Status: ${currenStatus}`);
}

setInterval(checkStatus, 5000);

app.post('/login', async (req, res) => {
    const { userId, token } = req.body

    if (!userId || !token) {
        return res.status(400).json({ error: 'userId and token required' })
    }

    const hashedToken = users[userId]
    if (!hashedToken) {
        return res.status(401).json({ error: 'Invalid user' })
    }

    const valid = await bcrypt.compare(token, hashedToken)
    if (!valid) {
        return res.status(401).json({ error: 'Invalid token' })
    }

    const jwtToken = jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: '1y' }
    )

    res.json({ success: true, token: jwtToken })
})


function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
        (req as any).userId = payload.userId
        next()
    } catch (err) {
        console.log(`Failed authentication: ${err}`)
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}


app.get('/status', authMiddleware, (req, res) => {
    res.send(currenStatus)
});




const commands = [
    'start',
    'stop',
    'dawn',
    'noon',
    'dusk',
    'midnight',
    'save',
]

for (const command of commands) {
    app.post(`/${command}`, authMiddleware, async (req, res) => {
        try {
            const response = await fetch(
                `${API_URL}/${command}`,
                {
                    method: 'POST',
                }
            )

            if (!response.ok) {
                return res
                    .status(response.status)
                    .json({ error: `Upstream returned ${response.status}` })
            }

            res.json({
                success: true,
                message: `${command} command sent`,
            })
        } catch (err) {
            console.error(err)

            res.status(500).json({
                success: false,
                message: `Failed to send ${command}`,
            })
        }
    })
}



app.listen(8000, () => {
    console.log('Listening on port 9000')
})
