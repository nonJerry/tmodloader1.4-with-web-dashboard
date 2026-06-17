import { RedisStore } from "connect-redis"
import expressSession from "express-session"
import { createClient } from 'redis'
import { config, IS_PRODUCTION } from "./constants.js"
import { RequestHandler } from "express"


let potSession: RequestHandler

if (IS_PRODUCTION || config.redisUser) {
  console.log(`Configuring redis store on ${config.redisHost}:${config.redisPort}`)
  const redis = createClient({
    username: config.redisUser,
    password: config.redisPassword,
    socket: {
      host: config.redisHost,
      port: config.redisPort
    }
  })
  redis.on('connect', () => {
    console.log('Connected to Redis')
  })
  redis.on('error', err => console.log('Redis Client Error', err))

  await redis.connect()

  const redisStore = new RedisStore({
    client: redis,
    prefix: "csrf-terraria-session:",
  })
  potSession = expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    // maxAge is 1 hour in ms
    cookie: { secure: IS_PRODUCTION, sameSite: "lax", signed: true, maxAge: 3.6e6 },
    name: config.sessionIdCookie,
    store: redisStore,
  })
} else {
  console.log('Using memory store for sessions')
  potSession = expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    // maxAge is 1 hour in ms
    cookie: { secure: IS_PRODUCTION, sameSite: "lax", signed: true, maxAge: 3.6e6 },
    name: config.sessionIdCookie
    // Dev config without store
  })
}

const session = potSession

export default session
