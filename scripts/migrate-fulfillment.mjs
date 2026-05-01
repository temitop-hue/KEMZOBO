import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Migrating orders for fulfillment queue...\n");

// 1. Expand status enum to include 'packed'
await conn.execute(`
  ALTER TABLE orders
  MODIFY COLUMN status ENUM('pending','processing','packed','shipped','delivered','cancelled')
  DEFAULT 'pending'
`);
console.log("  Status enum expanded with 'packed'");

// 2. Add fulfillment timestamps (idempotent — skip if already exist)
const cols = ["packedAt", "shippedAt", "deliveredAt"];
for (const col of cols) {
  const [existing] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
    [col]
  );
  if (existing.length > 0) {
    console.log(`  Skipped: ${col} already exists`);
    continue;
  }
  await conn.execute(`ALTER TABLE orders ADD COLUMN ${col} TIMESTAMP NULL`);
  console.log(`  Added: ${col}`);
}

await conn.end();
console.log("\nDone.");
