/**
 * One-off: reset the admin's password to a specified plaintext value.
 * Uses the same scrypt hashing the app itself uses (server/_core/password.ts).
 *
 * Usage:
 *   node scripts/reset-admin-password.mjs <email> <newPassword>
 */
import "dotenv/config";
import crypto from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

const scryptAsync = promisify(crypto.scrypt);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/reset-admin-password.mjs <email> <password>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const derivedKey = await scryptAsync(password, salt, 64);
const passwordHash = `${salt}:${derivedKey.toString("hex")}`;

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const [result] = await conn.execute(
  "UPDATE users SET passwordHash = ? WHERE email = ?",
  [passwordHash, email]
);

console.log(`Rows updated: ${result.affectedRows}`);
if (result.affectedRows === 0) {
  console.error(`No user found for email: ${email}`);
  process.exit(2);
}
console.log(`Password reset for ${email}.`);
await conn.end();
