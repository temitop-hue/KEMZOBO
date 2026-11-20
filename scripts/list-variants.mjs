/**
 * Read-only: list every product with its variants, prices and stock.
 *
 * Usage:
 *   node scripts/list-variants.mjs
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.execute(`
  SELECT p.id AS productId, p.name AS product, p.isActive AS productActive,
         v.id AS variantId, v.name AS variant, v.price, v.sku, v.weight, v.isActive AS variantActive,
         i.quantityAvailable AS stock
  FROM products p
  LEFT JOIN product_variants v ON v.productId = p.id
  LEFT JOIN inventory i ON i.variantId = v.id
  ORDER BY p.id, v.sortOrder, v.id
`);
console.table(rows);
await conn.end();
