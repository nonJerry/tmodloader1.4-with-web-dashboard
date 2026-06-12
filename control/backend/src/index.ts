
import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from 'express-session';
import { SESSION_SECRET, COOKIE_SECRET, IS_PRODUCTION } from './config/constants.js';
import { doubleCsrfProtection, generateCsrfToken } from "./config/csrf.js";
import corsConfig from "./config/cors.js";
import errorHandler from "./middleware/error-handler.js";
import commandsRouter from './api/routes/commands.routes.js'
import authRouter from './api/routes/auth.routes.js'
import statusRouter from './api/routes/status.routes.js';
//import session from './config/session.js';


console.log(`Running in production: ${IS_PRODUCTION}`)
const app = express();



app.use(helmet())
app.use(corsConfig);
app.use(cookieParser(COOKIE_SECRET));
app.use(express.json());
//app.use(session);


app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        // maxAge is 1 hour in ms
        cookie: { secure: IS_PRODUCTION, sameSite: "lax", signed: true, maxAge: 3.6e6 },
        // Dev config without store
    }),
);

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('SESSION:', req.session?.id);
    (req.session as any).lastSeen = Date.now();
    next();
});


app.get("/csrf-token", (req, res) => {
    const csrfToken = generateCsrfToken(req, res);
    res.status(200).json({ csrfToken });
});


app.use('/', authRouter)
app.use(doubleCsrfProtection);
app.use('/api', statusRouter)
app.use('/api', commandsRouter)
app.use(errorHandler);

app.listen(8000, () => {
    console.log('Listening on port 8000')
})
