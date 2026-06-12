import fs from "node:fs";
import path from "node:path";
import bcrypt from 'bcrypt'


export type Users = Record<string, string>;

const usersPath =
    process.env.USERS_FILE_PATH
        ? path.resolve(process.env.USERS_FILE_PATH)
        : path.resolve("../../users.json"); // looks from backend not src

async function generatePasswordHash(password: string) {
    if (!password) {
        throw new Error("Password is required");
    }
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.log("Usage: npx ts-node addUser.ts <username> <password>");
    process.exit(1);
}

const hash = await generatePasswordHash(password);

let users = {} as Users;
if (fs.existsSync(usersPath)) {
    users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
    console.log(`Existing users: ${Object.keys(users).join(', ')}`);
}

users[username] = hash;
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
console.log(`User '${username}' added/updated in ${usersPath}`);
