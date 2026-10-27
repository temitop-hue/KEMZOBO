/**
 * One-off: list admin accounts, or promote an existing user to admin.
 *
 * Usage:
 *   node scripts/set-admin.mjs              # list current admins
 *   node scripts/set-admin.mjs <email>      # promote <email> to admin
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const email = process.argv[2];

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

if (email) {
  const [result] = await conn.execute(
    "UPDATE users SET role = 'admin' WHERE email = ?",
    [email]
  );
  if (result.affectedRows === 0) {
    console.error(`No user found for email: ${email} — sign up on the site first, then re-run.`);
  } else {
    console.log(`${email} is now an admin. Log out and back in (or refresh /admin).`);
  }
}

const [admins] = await conn.execute(
  "SELECT id, email, name, lastSignedIn FROM users WHERE role = 'admin'"
);
console.log("Current admins:");
console.table(admins);
await conn.end();
