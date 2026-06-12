export const API_PORT = Number(process.env.API_PORT || 8000);
export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
export const SESSION_SECRET = process.env.SESSION_SECRET ?? 'assdafasdf';
export const CSRF_SECRET = process.env.CSRF_SECRET ?? 'sdfgvsarg35g345';
export const REDIS_HOST = process.env.REDIS_HOST ?? '';
export const REDIS_PORT = Number(process.env.REDIS_PORT || 0);
export const COOKIE_PREFIX = process.env.COOKIE_PREFIX || '__Secure-terraria-control'
export const IS_PRODUCTION = process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'staging';
export const JWT_SECRET = process.env.JWT_SECRET || 'terraria-control'
export const COOKIE_SECRET = process.env.JWT_SECRET || 'allCookiesAreMine'
const BASE_URL = process.env.BASE_URL || 'http://terraria:6002'
const BASE_PATH = process.env.BASE_PATH || '/cgi-bin/api'
export const API_URL = new URL(BASE_PATH, BASE_URL).toString()
export const SESSION_BOUND_TOKEN = process.env.SESSION_BOUND_TOKEN === 'true';