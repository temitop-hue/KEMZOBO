/**
 * One-off: cans are 16 fl oz (confirmed by Erefa 2026-11-24), not 16.9.
 * Relabels the case variants and fixes any product text that says 16.9. Idempotent.
 *
 * Usage:
 *   node scripts/migrate-can-size.mjs
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const [variants] = await conn.execute(
  `UPDATE product_variants SET weight = REPLACE(weight, '16.9 fl oz', '16 fl oz') WHERE weight LIKE '%16.9%'`
);
console.log(`Variants relabeled: ${variants.affectedRows}`);

for (const col of ["description", "shortDescription"]) {
  const [exists] = await conn.execute(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = ?`,
    [col]
  );
  if (exists.length === 0) continue;
  const [res] = await conn.execute(
    `UPDATE products SET ${col} = REPLACE(REPLACE(${col}, '16.9 fl oz', '16 fl oz'), '16.9oz', '16oz') WHERE ${col} LIKE '%16.9%'`
  );
  console.log(`products.${col} updated: ${res.affectedRows}`);
}

const [left] = await conn.execute(
  `SELECT v.id, v.name, v.weight FROM product_variants v WHERE v.weight LIKE '%16.9%'`
);
console.log(left.length ? `Still mentions 16.9: ${JSON.stringify(left)}` : "No 16.9 left in variants.");
await conn.end();
