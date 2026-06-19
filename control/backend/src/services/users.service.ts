import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../../..");
const DEFAULT_SECRET_PATHS = [
  process.env.USERS_FILE_PATH,
  '/run/secrets/users'
].filter((p): p is string => typeof p === 'string') // remove not set env vars

const usersFilePath = path.resolve(projectRoot, DEFAULT_SECRET_PATHS.find(filePath => fs.existsSync(filePath)) || 'example.users.json')

const users = JSON.parse(
  fs.readFileSync(usersFilePath, 'utf8')
) as Users
console.log('Loaded users:', Object.keys(users))

export type Users = Record<string, string>

export default users
