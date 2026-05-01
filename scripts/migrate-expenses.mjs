import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Creating expenses table...\n");

const [existing] = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'expenses'`
);

if (existing.length > 0) {
  console.log("  Skipped: expenses already exists");
} else {
  await conn.execute(`
    CREATE TABLE expenses (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      amount INT NOT NULL,
      category ENUM('ingredients','packaging','shipping','marketing','equipment','fees','other') NOT NULL,
      description VARCHAR(500) NOT NULL,
      occurredAt TIMESTAMP NOT NULL,
      createdByUserId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_expenses_occurred (occurredAt),
      INDEX idx_expenses_category (category, occurredAt)
    )
  `);
  console.log("  Created: expenses");
}

await conn.end();
console.log("\nDone.");
