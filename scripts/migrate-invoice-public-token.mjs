import "dotenv/config";
import mysql from "mysql2/promise";
import crypto from "node:crypto";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Adding publicToken to invoices...\n");

const [existing] = await conn.execute(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND COLUMN_NAME = 'publicToken'`
);

if (existing.length > 0) {
  console.log("  Skipped: publicToken column already exists");
} else {
  // TiDB requires adding column + index in separate statements
  await conn.execute(`ALTER TABLE invoices ADD COLUMN publicToken VARCHAR(64)`);
  console.log("  Added: invoices.publicToken");
}

// Backfill BEFORE creating the unique index (NULLs in unique index are allowed
// but we'd rather have them all populated)

// Backfill tokens for existing invoices that don't have one
const [rows] = await conn.execute(
  `SELECT id FROM invoices WHERE publicToken IS NULL`
);
console.log(`  Backfilling ${rows.length} existing invoice(s)...`);
for (const r of rows) {
  const token = crypto.randomUUID().replace(/-/g, "");
  await conn.execute(`UPDATE invoices SET publicToken = ? WHERE id = ?`, [token, r.id]);
}

// Add the unique index once data is populated
const [idx] = await conn.execute(
  `SELECT INDEX_NAME FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoices' AND INDEX_NAME = 'idx_invoices_public_token'`
);
if (idx.length === 0) {
  await conn.execute(`CREATE UNIQUE INDEX idx_invoices_public_token ON invoices(publicToken)`);
  console.log("  Created unique index on publicToken");
} else {
  console.log("  Skipped: unique index already exists");
}

await conn.end();
console.log("\nDone.");
