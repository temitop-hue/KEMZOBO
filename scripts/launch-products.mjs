import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Updating products for launch (Original Zobo only)...\n");

// 1. Rename "Classic Zobo" -> "Original Zobo" (slug: original-zobo) if not already done
const [classic] = await conn.execute(
  "SELECT id, name, slug FROM products WHERE slug = 'classic-zobo' OR slug = 'original-zobo' LIMIT 1"
);
if (classic.length === 0) {
  console.log("  WARNING: no 'classic-zobo' or 'original-zobo' product found. Aborting.");
  await conn.end();
  process.exit(1);
}
const target = classic[0];
if (target.slug !== "original-zobo") {
  await conn.execute(
    "UPDATE products SET name = 'Original Zobo', slug = 'original-zobo' WHERE id = ?",
    [target.id]
  );
  console.log(`  Renamed product id=${target.id}: "${target.name}" -> "Original Zobo" (slug: original-zobo)`);
} else {
  console.log(`  Already named Original Zobo (id=${target.id}) - skipping rename.`);
}

// Make sure Original Zobo is active and featured
await conn.execute(
  "UPDATE products SET isActive = 1, isFeatured = 1 WHERE id = ?",
  [target.id]
);

// 2. Soft-disable all other flavors
const slugsToDisable = [
  "ginger-zobo",
  "pineapple-zobo",
  "mango-zobo",
  "cinnamon-spice-zobo",
  "hibiscus-lemonade",
];
for (const slug of slugsToDisable) {
  const [r] = await conn.execute(
    "UPDATE products SET isActive = 0, isFeatured = 0 WHERE slug = ?",
    [slug]
  );
  if (r.affectedRows > 0) {
    console.log(`  Disabled: ${slug}`);
  } else {
    console.log(`  Skipped (not found): ${slug}`);
  }
}

// 3. Verify
const [active] = await conn.execute(
  "SELECT slug, name, isActive, isFeatured FROM products ORDER BY id"
);
console.log("\nFinal state:");
for (const p of active) {
  console.log(`  ${p.slug.padEnd(25)} active=${p.isActive} featured=${p.isFeatured}`);
}

await conn.end();
console.log("\nDone.");
