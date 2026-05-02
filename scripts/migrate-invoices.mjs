import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Creating invoices + invoice_items tables...\n");

const tables = await conn.execute(
  `SELECT TABLE_NAME FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('invoices','invoice_items')`
);
const existing = new Set(tables[0].map((r) => r.TABLE_NAME));

if (!existing.has("invoices")) {
  await conn.execute(`
    CREATE TABLE invoices (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
      status ENUM('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
      clientName VARCHAR(255) NOT NULL,
      clientEmail VARCHAR(320),
      clientPhone VARCHAR(50),
      clientAddress TEXT,
      subtotal INT NOT NULL,
      tax INT DEFAULT 0,
      total INT NOT NULL,
      notes TEXT,
      issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      dueAt TIMESTAMP NOT NULL,
      sentAt TIMESTAMP NULL,
      paidAt TIMESTAMP NULL,
      wholesaleRequestId INT,
      createdByUserId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_invoices_status (status, dueAt),
      INDEX idx_invoices_due (dueAt)
    )
  `);
  console.log("  Created: invoices");
} else console.log("  Skipped: invoices exists");

if (!existing.has("invoice_items")) {
  await conn.execute(`
    CREATE TABLE invoice_items (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      invoiceId INT NOT NULL,
      description VARCHAR(500) NOT NULL,
      quantity INT NOT NULL,
      unitPrice INT NOT NULL,
      lineTotal INT NOT NULL,
      INDEX idx_invoice_items_invoice (invoiceId)
    )
  `);
  console.log("  Created: invoice_items");
} else console.log("  Skipped: invoice_items exists");

await conn.end();
console.log("\nDone.");
