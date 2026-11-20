/**
 * Shippo shipping rollout:
 *  1. Adds orders.shippingCarrier / shippingService / shippingBoxes
 *  2. Deactivates the Single Can and 6-Pack variants (12-can case is the only size sold)
 *  3. Labels the 12-can case with the correct can size (16.9 fl oz)
 * Safe to re-run.
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Shipping rollout migration...\n");

const columns = [
  ["shippingCarrier", "VARCHAR(50) NULL"],
  ["shippingService", "VARCHAR(100) NULL"],
  ["shippingBoxes", "INT NULL"],
];

for (const [name, ddl] of columns) {
  const [existing] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
    [name]
  );
  if (existing.length > 0) {
    console.log(`  Skipped: orders.${name} already exists`);
  } else {
    await conn.execute(`ALTER TABLE orders ADD COLUMN ${name} ${ddl}`);
    console.log(`  Added: orders.${name}`);
  }
}

const [deactivated] = await conn.execute(
  `UPDATE product_variants SET isActive = 0
   WHERE isActive = 1 AND (name LIKE 'Single Can%' OR name = '6-Pack')`
);
console.log(`  Deactivated ${deactivated.affectedRows} Single Can / 6-Pack variants`);

const [relabeled] = await conn.execute(
  `UPDATE product_variants SET weight = '12 x 16.9 fl oz' WHERE name = 'Case of 12'`
);
console.log(`  Relabeled ${relabeled.affectedRows} Case of 12 variants as 12 x 16.9 fl oz`);

await conn.end();
console.log("\nDone.");
