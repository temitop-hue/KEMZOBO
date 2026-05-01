import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Creating inventory_movements table...\n");

const [existing] = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory_movements'`
);

if (existing.length > 0) {
  console.log("  Skipped: inventory_movements already exists");
} else {
  await conn.execute(`
    CREATE TABLE inventory_movements (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      variantId INT NOT NULL,
      quantityDelta INT NOT NULL,
      balanceAfter INT NOT NULL,
      reason ENUM('sale','refund_restock','restock','manual_adjustment','loss','correction') NOT NULL,
      reference VARCHAR(100),
      note TEXT,
      createdByUserId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_inv_mov_variant (variantId, createdAt),
      INDEX idx_inv_mov_reason (reason, createdAt),
      INDEX idx_inv_mov_reference (reference)
    )
  `);
  console.log("  Created: inventory_movements");
}

await conn.end();
console.log("\nDone.");
