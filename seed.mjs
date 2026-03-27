import "dotenv/config";
import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log("Seeding Kem Zobo database...\n");

// ─── Products ────────────────────────────────────────────
const products = [
  {
    name: "Classic Zobo",
    slug: "classic-zobo",
    description: "The original hibiscus drink. Bold, tangy, and perfectly balanced. Made from hand-selected hibiscus flowers with a hint of natural sweetness.",
    category: "classic",
    isActive: 1,
    isFeatured: 1,
  },
  {
    name: "Ginger Zobo",
    slug: "ginger-zobo",
    description: "Our classic Zobo infused with fresh ginger root. A warming, spicy twist on the traditional favorite. Great served chilled or warm.",
    category: "spiced",
    isActive: 1,
    isFeatured: 1,
  },
  {
    name: "Pineapple Zobo",
    slug: "pineapple-zobo",
    description: "Tropical pineapple meets West African hibiscus. Sweet, tangy, and incredibly refreshing. A crowd favorite at every gathering.",
    category: "tropical",
    isActive: 1,
    isFeatured: 1,
  },
  {
    name: "Mango Zobo",
    slug: "mango-zobo",
    description: "Lush mango blended with our signature hibiscus base. Smooth, fruity, and bursting with tropical flavor.",
    category: "tropical",
    isActive: 1,
    isFeatured: 1,
  },
  {
    name: "Cinnamon Spice Zobo",
    slug: "cinnamon-spice-zobo",
    description: "Warm cinnamon and clove spices paired with rich hibiscus. Perfect for cooler days or as a unique holiday drink.",
    category: "spiced",
    isActive: 1,
    isFeatured: 0,
  },
  {
    name: "Hibiscus Lemonade",
    slug: "hibiscus-lemonade",
    description: "Zobo meets classic lemonade. Bright, citrusy, and oh-so-refreshing. The perfect summer drink.",
    category: "classic",
    isActive: 1,
    isFeatured: 0,
  },
];

for (const p of products) {
  const [existing] = await conn.execute("SELECT id FROM products WHERE slug = ?", [p.slug]);
  if (existing.length > 0) {
    console.log(`  Skipped product: ${p.name} (exists)`);
    continue;
  }

  const [result] = await conn.execute(
    "INSERT INTO products (name, slug, description, category, isActive, isFeatured) VALUES (?, ?, ?, ?, ?, ?)",
    [p.name, p.slug, p.description, p.category, p.isActive, p.isFeatured]
  );
  const productId = result.insertId;
  console.log(`  Created product: ${p.name} (id: ${productId})`);

  // ─── Variants for each product ─────────────────────────
  const variants = [
    { name: "Single Can (12 oz)", price: 399, sku: `${p.slug}-1`, weight: "12 oz", sortOrder: 1 },
    { name: "6-Pack", price: 2199, sku: `${p.slug}-6`, weight: "6 x 12 oz", sortOrder: 2 },
    { name: "Case of 24", price: 7999, sku: `${p.slug}-24`, weight: "24 x 12 oz", sortOrder: 3 },
  ];

  for (const v of variants) {
    const [vResult] = await conn.execute(
      "INSERT INTO product_variants (productId, name, price, sku, weight, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, 1, ?)",
      [productId, v.name, v.price, v.sku, v.weight, v.sortOrder]
    );
    const variantId = vResult.insertId;

    // Create inventory record
    await conn.execute(
      "INSERT INTO inventory (productId, variantId, quantityAvailable, lowStockThreshold) VALUES (?, ?, ?, ?)",
      [productId, variantId, 100, 10]
    );
  }
  console.log(`    Added 3 variants + inventory`);
}

// ─── Verify ──────────────────────────────────────────────
const [prodCount] = await conn.execute("SELECT COUNT(*) as c FROM products");
const [varCount] = await conn.execute("SELECT COUNT(*) as c FROM product_variants");
const [invCount] = await conn.execute("SELECT COUNT(*) as c FROM inventory");

console.log(`\nDone! ${prodCount[0].c} products, ${varCount[0].c} variants, ${invCount[0].c} inventory records`);

await conn.end();
