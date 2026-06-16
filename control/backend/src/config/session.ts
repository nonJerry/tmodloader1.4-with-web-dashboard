import { RedisStore } from "connect-redis";
import expressSession from "express-session";
import { createClient } from 'redis';
import { IS_PRODUCTION, REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASSWORD, SESSION_SECRET, COOKIE_PREFIX, XSRF_TOKEN_COOKIE } from "./constants.js";
import { RequestHandler } from "express";


let potSession: RequestHandler;

if (IS_PRODUCTION || REDIS_USER) {
  console.log(`Configuring redis store on ${REDIS_HOST}:${REDIS_PORT}`);
  const redis = createClient({
    username: REDIS_USER,
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT
    }
  });
  redis.on('connect', () => {
    console.log('Connected to Redis');
  });
  redis.on('error', err => console.log('Redis Client Error', err));

  await redis.connect();

  const redisStore = new RedisStore({
    client: redis,
    prefix: "csrf-terraria-session:",
  });
  potSession = expressSession({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    // maxAge is 1 hour in ms
    cookie: { secure: IS_PRODUCTION, sameSite: "lax", signed: true, maxAge: 3.6e6 },
    name: XSRF_TOKEN_COOKIE,
    store: redisStore,
  })
} else {
  console.log('Using memory store for sessions')
  potSession = expressSession({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    // maxAge is 1 hour in ms
    cookie: { secure: IS_PRODUCTION, sameSite: "lax", signed: true, maxAge: 3.6e6 },
    name: XSRF_TOKEN_COOKIE
    // Dev config without store
  })
}

const session = potSession

export default session;