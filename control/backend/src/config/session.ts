import { RedisStore } from "connect-redis";
import expressSession from "express-session";
import { Redis } from "ioredis";
import { REDIS_HOST, REDIS_PORT, SESSION_SECRET } from "./constants.js";

console.log(`Configuring redis store on ${REDIS_HOST}:${REDIS_PORT}`);
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

// TODO add user and pw
const redisStore = new RedisStore({
  client: redis,
  prefix: "csrf-terraria-session:",
});

const session = expressSession({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  // maxAge is 1 hour in ms
  cookie: { secure: true, sameSite: "lax", signed: true, maxAge: 3.6e6 },
  store: redisStore,
});

export default session;