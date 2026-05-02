import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Adding abandonedReminderSentAt to orders...\n");

const [existing] = await conn.execute(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'abandonedReminderSentAt'`
);

if (existing.length > 0) {
  console.log("  Skipped: column already exists");
} else {
  await conn.execute(
    `ALTER TABLE orders ADD COLUMN abandonedReminderSentAt TIMESTAMP NULL`
  );
  console.log("  Added: orders.abandonedReminderSentAt");
}

await conn.end();
console.log("\nDone.");
