import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const [existing] = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reviews'`
);

if (existing.length > 0) {
  console.log("Skipped: reviews already exists");
} else {
  await conn.execute(`
    CREATE TABLE reviews (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      productId INT NOT NULL,
      orderId INT,
      customerEmail VARCHAR(320) NOT NULL,
      customerName VARCHAR(120) NOT NULL,
      rating INT NOT NULL,
      title VARCHAR(200),
      body TEXT NOT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'approved',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reviews_product (productId, status, createdAt),
      INDEX idx_reviews_status (status, createdAt),
      INDEX idx_reviews_order (orderId)
    )
  `);
  console.log("Created: reviews");
}

await conn.end();
