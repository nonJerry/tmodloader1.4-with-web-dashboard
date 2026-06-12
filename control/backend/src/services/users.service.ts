import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_SECRET_PATHS = [
    process.env.USERS_FILE_PATH,
    '/run/secrets/users'
].filter((p): p is string => typeof p === 'string') // remove not set env vars

const usersFilePath = path.resolve(DEFAULT_SECRET_PATHS.find(filePath => fs.existsSync(filePath)) || '../../example.users.json');

const users = JSON.parse(
    fs.readFileSync(usersFilePath, 'utf8')
) as Users
console.log('Loaded users:', Object.keys(users))

export type Users = Record<string, string>;

export default users