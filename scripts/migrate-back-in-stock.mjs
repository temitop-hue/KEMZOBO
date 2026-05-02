import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const [existing] = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'back_in_stock_subs'`
);

if (existing.length > 0) {
  console.log("Skipped: back_in_stock_subs already exists");
} else {
  await conn.execute(`
    CREATE TABLE back_in_stock_subs (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      variantId INT NOT NULL,
      email VARCHAR(320) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notifiedAt TIMESTAMP NULL,
      INDEX idx_bis_variant_pending (variantId, notifiedAt),
      INDEX idx_bis_email (email)
    )
  `);
  console.log("Created: back_in_stock_subs");
}

await conn.end();
