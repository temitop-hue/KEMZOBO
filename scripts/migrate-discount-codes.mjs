import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Migrating for discount codes...\n");

// 1) discount_codes table
const [existing] = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'discount_codes'`
);

if (existing.length > 0) {
  console.log("  Skipped: discount_codes already exists");
} else {
  await conn.execute(`
    CREATE TABLE discount_codes (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(200),
      type ENUM('percent','fixed_amount') NOT NULL,
      value INT NOT NULL,
      minOrderTotal INT DEFAULT 0,
      usageLimit INT,
      usageCount INT DEFAULT 0,
      validFrom TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      validUntil TIMESTAMP NULL,
      isActive INT DEFAULT 1,
      createdByUserId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_discount_active (isActive, validFrom, validUntil)
    )
  `);
  console.log("  Created: discount_codes");
}

// 2) Add discountCode + discountAmount to orders (idempotent)
const cols = [
  ["discountCode", "VARCHAR(50)"],
  ["discountAmount", "INT DEFAULT 0"],
];
for (const [name, ddl] of cols) {
  const [existsRow] = await conn.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = ?`,
    [name]
  );
  if (existsRow.length > 0) {
    console.log(`  Skipped: orders.${name} already exists`);
  } else {
    await conn.execute(`ALTER TABLE orders ADD COLUMN ${name} ${ddl}`);
    console.log(`  Added: orders.${name}`);
  }
}

await conn.end();
console.log("\nDone.");
