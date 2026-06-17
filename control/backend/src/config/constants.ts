const BASE_URL = process.env.BASE_URL || 'http://terraria:6002'
const BASE_PATH = process.env.BASE_PATH || '/cgi-bin/api'
const COOKIE_PREFIX = process.env.COOKIE_PREFIX || '__Secure-terraria-control'

export const IS_PRODUCTION = !['development', 'staging', 'test', 'unittest'].includes(process.env.NODE_ENV || 'production')

const settings = {
  apiPort: Number(process.env.API_PORT || 8000),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  sessionSecret: process.env.SESSION_SECRET ?? 'assdafasdf',
  csrfSecret: process.env.CSRF_SECRET ?? 'sdfgvsarg35g345',
  redisHost: process.env.REDIS_HOST ?? 'redis',
  redisPort: Number(process.env.REDIS_PORT || 6379),
  redisUser: process.env.REDIS_USER || undefined,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
  cookiePrefix: COOKIE_PREFIX,
  jwtSecret: process.env.JWT_SECRET || 'terraria-control',
  cookieSecret: process.env.COOKIE_SECRET || 'allCookiesAreMine',
  apiUrl: new URL(BASE_PATH, BASE_URL).toString(),
  isSessionBound: process.env.SESSION_BOUND_TOKEN === 'true',


  accessTokenCookie: IS_PRODUCTION ? `${COOKIE_PREFIX}_access-token` : 'access-token',
  refreshTokenCookie: IS_PRODUCTION ? `${COOKIE_PREFIX}_refresh-token` : 'refresh-token',
  xsrfTokenCookie: IS_PRODUCTION ? `${COOKIE_PREFIX}_xsrf-token` : 'xsrf-token',
  sessionIdCookie: IS_PRODUCTION ? `${COOKIE_PREFIX}_session-id` : 'connect.sid'
}

export const config = IS_PRODUCTION ? Object.freeze(settings) : settings
