import PptxGenJS from "pptxgenjs";
import fs from "fs";
import path from "path";

const pptx = new PptxGenJS();

// ─── Brand Constants ─────────────────────────────────────
const BRAND = {
  red: "C41E1E",
  darkRed: "8B1A1A",
  cream: "FAF0E6",
  gold: "D4A843",
  ink: "1C1917",
  white: "FFFFFF",
  green: "166534",
  lightGray: "F5F0EB",
  muted: "6B6560",
};

const FONT_DISPLAY = "Playfair Display";
const FONT_BODY = "DM Sans";

// Helper: convert local image to base64 data URI
function imgData(filename) {
  const imgPath = path.resolve("client/public/images", filename);
  if (!fs.existsSync(imgPath)) return null;
  const buf = fs.readFileSync(imgPath);
  const ext = filename.split(".").pop().toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

// Preload images
const heroImg = imgData("hero-can.png");
const heritageImg = imgData("heritage-glass.jpg");
const lifestyleImg = imgData("lifestyle-friends.jpg");
const tropicalImg = imgData("tropical-glass.jpg");
const barImg = imgData("bar-glass.jpg");
const logoImg = imgData("logo.png");

pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Concepts WebCraft";
pptx.company = "Kem Original Zobo";
pptx.subject = "Kem Zobo E-Commerce Platform";
pptx.title = "Kem Original Zobo — Digital Platform Overview";

// ═══════════════════════════════════════════════════════════
// SLIDE 1: TITLE
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  // Left side content
  if (logoImg) {
    slide.addImage({ data: logoImg, x: 0.8, y: 0.6, w: 2.0, h: 2.0, sizing: { type: "contain", w: 2.0, h: 2.0 } });
  }
  slide.addText("Kem Original\nZobo", {
    x: 0.8, y: 2.7, w: 5.5, h: 2.0,
    fontFace: FONT_DISPLAY, fontSize: 44, color: BRAND.red, bold: true, lineSpacing: 52,
  });
  slide.addText("E-Commerce & Digital Platform", {
    x: 0.8, y: 4.6, w: 5.5, h: 0.6,
    fontFace: FONT_DISPLAY, fontSize: 22, color: BRAND.ink, italic: true,
  });
  slide.addText("Built by Concepts WebCraft  •  March 2026", {
    x: 0.8, y: 5.3, w: 5.5, h: 0.5,
    fontFace: FONT_BODY, fontSize: 13, color: BRAND.muted,
  });
  slide.addText("Made with a blend of nature's finest Hibiscus  •  16 FL. OZ (473 ML)", {
    x: 0.8, y: 5.8, w: 5.5, h: 0.4,
    fontFace: FONT_BODY, fontSize: 11, color: BRAND.muted, italic: true,
  });

  // Right side image
  if (heroImg) {
    slide.addImage({ data: heroImg, x: 6.8, y: 0.3, w: 6.0, h: 6.8, sizing: { type: "contain", w: 6.0, h: 6.8 } });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 2: THE VISION
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  slide.addText("The Vision", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  slide.addText(
    "Build a premium e-commerce platform for Kem Original Zobo — the leading US-based " +
    "canned hibiscus drink brand. The platform enables retail customers to order online, " +
    "wholesale partners to submit bulk inquiries, and the business to manage every aspect " +
    "from one powerful admin dashboard.",
    {
      x: 0.8, y: 1.8, w: 7.5, h: 1.5,
      fontFace: FONT_BODY, fontSize: 15, color: BRAND.ink, lineSpacing: 24,
    }
  );

  const goals = [
    "Direct-to-consumer online ordering with Stripe payments",
    "Wholesale inquiry portal for stores, restaurants & events",
    "Product variant system (Single Can, 6-Pack, Case of 24)",
    "Dynamic bulk pricing with live discount feedback",
    "Full admin dashboard for products, orders & customers",
    "Mobile-first design for Instagram/WhatsApp traffic",
  ];
  goals.forEach((g, i) => {
    slide.addText(`●  ${g}`, {
      x: 0.8, y: 3.5 + i * 0.5, w: 7.5, h: 0.45,
      fontFace: FONT_BODY, fontSize: 13, color: BRAND.ink,
    });
  });

  if (lifestyleImg) {
    slide.addImage({ data: lifestyleImg, x: 8.8, y: 1.5, w: 4.0, h: 5.0, rounding: true, sizing: { type: "cover", w: 4.0, h: 5.0 } });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 3: WHAT'S BEEN BUILT
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.white };

  slide.addText("What's Been Built", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  const cols = [
    {
      title: "20 Pages",
      items: [
        "Home (hero, lifestyle, products)",
        "Products catalog + detail",
        "About — brand story",
        "Contact form",
        "Wholesale inquiry",
        "Cart + Checkout",
        "Order confirmation",
        "Login / Register",
        "Password reset flow",
        "Customer account + orders",
      ],
    },
    {
      title: "6 Admin Pages",
      items: [
        "Dashboard with KPIs",
        "Product CRUD management",
        "Order management + tracking",
        "Wholesale inquiry pipeline",
        "Customer list",
        "Contact message inbox",
      ],
    },
    {
      title: "Backend / API",
      items: [
        "30+ tRPC API endpoints",
        "JWT auth (email/password)",
        "Stripe payment integration",
        "8 database tables (TiDB)",
        "Product variants model",
        "Inventory with low-stock alerts",
        "Brevo email notifications",
        "Auto order confirmation emails",
      ],
    },
  ];

  cols.forEach((col, ci) => {
    const x = 0.8 + ci * 4.0;
    slide.addText(col.title, {
      x, y: 1.7, w: 3.6, h: 0.5,
      fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.red, bold: true,
    });
    col.items.forEach((item, i) => {
      slide.addText(`✓  ${item}`, {
        x, y: 2.3 + i * 0.42, w: 3.6, h: 0.38,
        fontFace: FONT_BODY, fontSize: 11, color: BRAND.ink,
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 4: TECH STACK
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  slide.addText("Technology Stack", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  const stack = [
    { cat: "Frontend", tech: "React 19, TypeScript, Tailwind CSS v4, Wouter router, Framer Motion" },
    { cat: "Backend", tech: "Express.js, tRPC v11 (type-safe API), SuperJSON" },
    { cat: "Database", tech: "TiDB Cloud (MySQL), Drizzle ORM, 8 tables" },
    { cat: "Payments", tech: "Stripe Elements (PaymentElement), webhooks, auto inventory" },
    { cat: "Auth", tech: "JWT (HS256) + httpOnly cookies, scrypt password hashing" },
    { cat: "Email", tech: "Brevo (Sendinblue) — order confirmations, password resets" },
    { cat: "Hosting", tech: "Railway (target) — Express serves Vite SPA in production" },
    { cat: "Design", tech: "Playfair Display + DM Sans, warm linen/red brand palette" },
  ];

  stack.forEach((s, i) => {
    const y = 1.8 + i * 0.62;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y, w: 11.5, h: 0.52,
      fill: { color: i % 2 === 0 ? BRAND.lightGray : BRAND.white },
      rectRadius: 0.05,
    });
    slide.addText(s.cat, {
      x: 1.0, y, w: 2.0, h: 0.52,
      fontFace: FONT_BODY, fontSize: 13, color: BRAND.red, bold: true, valign: "middle",
    });
    slide.addText(s.tech, {
      x: 3.2, y, w: 9.0, h: 0.52,
      fontFace: FONT_BODY, fontSize: 12, color: BRAND.ink, valign: "middle",
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 5: E-COMMERCE FLOW
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.white };

  slide.addText("E-Commerce Flow", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  slide.addText('"Order in 3 Clicks" Experience', {
    x: 0.8, y: 1.6, w: 8, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, italic: true,
  });

  const steps = [
    { num: "01", title: "Browse & Select", desc: "Products page with flavor filters. Select variant (Single, 6-Pack, Case). Choose quantity — bulk pricing updates live." },
    { num: "02", title: "Cart & Review", desc: "Smart cart with bulk discount feedback. Free delivery over $50. Quantity controls with real-time price updates." },
    { num: "03", title: "Checkout & Pay", desc: "Shipping form → Stripe PaymentElement. Secure card input with branded UI. Auto order confirmation email." },
    { num: "04", title: "Track & Manage", desc: "Customer dashboard with order history. Status tracker (pending → processing → shipped → delivered). Admin updates tracking number." },
  ];

  steps.forEach((s, i) => {
    const x = 0.8 + i * 3.1;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.4, w: 2.8, h: 4.2,
      fill: { color: BRAND.cream },
      rectRadius: 0.15,
      line: { color: BRAND.red, width: 0.5, dashType: "solid" },
    });
    slide.addText(s.num, {
      x, y: 2.6, w: 2.8, h: 0.7,
      fontFace: FONT_DISPLAY, fontSize: 32, color: BRAND.red, bold: true, align: "center",
    });
    slide.addText(s.title, {
      x: x + 0.2, y: 3.4, w: 2.4, h: 0.5,
      fontFace: FONT_DISPLAY, fontSize: 15, color: BRAND.ink, bold: true,
    });
    slide.addText(s.desc, {
      x: x + 0.2, y: 4.0, w: 2.4, h: 2.2,
      fontFace: FONT_BODY, fontSize: 11, color: BRAND.muted, lineSpacing: 18,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 6: PRODUCT SYSTEM
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  slide.addText("Product & Pricing System", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  // Current products
  slide.addText("6 Launch Flavors", {
    x: 0.8, y: 1.7, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  const flavors = [
    "Classic Zobo — The original, bold & balanced",
    "Ginger Zobo — Warming spiced twist",
    "Pineapple Zobo — Sweet tropical favorite",
    "Mango Zobo — Smooth & fruity",
    "Cinnamon Spice Zobo — Holiday-ready warmth",
    "Hibiscus Lemonade — Bright citrus refresher",
  ];
  flavors.forEach((f, i) => {
    slide.addText(`🌺  ${f}`, {
      x: 0.8, y: 2.3 + i * 0.42, w: 5.5, h: 0.38,
      fontFace: FONT_BODY, fontSize: 12, color: BRAND.ink,
    });
  });

  // Variants
  slide.addText("3 Variants Per Product", {
    x: 0.8, y: 5.0, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 16, color: BRAND.ink, bold: true,
  });
  const variants = [
    "Single Can (16 oz)  —  $3.99",
    "6-Pack  —  $21.99",
    "Case of 24  —  $79.99",
  ];
  variants.forEach((v, i) => {
    slide.addText(v, {
      x: 0.8, y: 5.5 + i * 0.38, w: 5.5, h: 0.35,
      fontFace: FONT_BODY, fontSize: 12, color: BRAND.muted,
    });
  });

  // Bulk pricing
  slide.addText("Dynamic Bulk Pricing", {
    x: 7.0, y: 1.7, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  const tiers = [
    { qty: "24+ cases", disc: "~5% off", color: BRAND.gold },
    { qty: "100+ cases", disc: "~9% off", color: BRAND.red },
    { qty: "500+ cases", disc: "~14% off", color: BRAND.darkRed },
  ];
  tiers.forEach((t, i) => {
    const y = 2.4 + i * 1.2;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.0, y, w: 5.3, h: 0.95,
      fill: { color: BRAND.lightGray }, rectRadius: 0.1,
    });
    slide.addText(t.disc, {
      x: 7.3, y, w: 2.0, h: 0.95,
      fontFace: FONT_DISPLAY, fontSize: 22, color: t.color, bold: true, valign: "middle",
    });
    slide.addText(t.qty, {
      x: 9.5, y, w: 2.5, h: 0.95,
      fontFace: FONT_BODY, fontSize: 14, color: BRAND.muted, valign: "middle",
    });
  });

  slide.addText("Applied dynamically in cart with live\n\"Bulk Discount Applied!\" feedback", {
    x: 7.0, y: 6.0, w: 5.3, h: 0.7,
    fontFace: FONT_BODY, fontSize: 11, color: BRAND.muted, italic: true, lineSpacing: 16,
  });

  if (heroImg) {
    slide.addImage({ data: heroImg, x: 7.5, y: 4.8, w: 2.0, h: 2.0, sizing: { type: "contain", w: 2.0, h: 2.0 } });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 7: WHOLESALE SYSTEM
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.white };

  slide.addText("Wholesale & B2B System", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  slide.addText(
    "Dedicated wholesale inquiry portal for B2B growth — stores, restaurants, events, and distributors.",
    {
      x: 0.8, y: 1.7, w: 7.5, h: 0.7,
      fontFace: FONT_BODY, fontSize: 14, color: BRAND.ink, lineSpacing: 22,
    }
  );

  // Pipeline
  slide.addText("Inquiry Pipeline", {
    x: 0.8, y: 2.8, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  const pipeline = ["New", "Contacted", "Negotiating", "Approved"];
  pipeline.forEach((stage, i) => {
    const x = 0.8 + i * 2.8;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.5, w: 2.4, h: 0.7,
      fill: { color: i === 3 ? BRAND.green : BRAND.red },
      rectRadius: 0.1,
    });
    slide.addText(stage, {
      x, y: 3.5, w: 2.4, h: 0.7,
      fontFace: FONT_BODY, fontSize: 14, color: BRAND.white, bold: true, align: "center", valign: "middle",
    });
    if (i < 3) {
      slide.addText("→", {
        x: x + 2.4, y: 3.5, w: 0.4, h: 0.7,
        fontFace: FONT_BODY, fontSize: 18, color: BRAND.muted, align: "center", valign: "middle",
      });
    }
  });

  // Features
  const features = [
    "Public wholesale form with business type, volume estimates",
    "Bulk pricing tiers displayed (5%, 9%, 14% discounts)",
    "Admin pipeline management with status workflow",
    "Admin notes for each inquiry",
    "Business types: Store, Restaurant, Event, Distributor",
  ];
  features.forEach((f, i) => {
    slide.addText(`●  ${f}`, {
      x: 0.8, y: 4.8 + i * 0.45, w: 7.5, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12, color: BRAND.ink,
    });
  });

  if (heritageImg) {
    slide.addImage({ data: heritageImg, x: 8.8, y: 1.5, w: 4.0, h: 5.5, rounding: true, sizing: { type: "cover", w: 4.0, h: 5.5 } });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 8: ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  slide.addText("Admin Dashboard", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  slide.addText("Complete business management from one interface", {
    x: 0.8, y: 1.6, w: 11, h: 0.5,
    fontFace: FONT_BODY, fontSize: 14, color: BRAND.muted, italic: true,
  });

  const panels = [
    { title: "Dashboard", desc: "KPI cards: total orders, revenue,\npending orders, low-stock alerts", icon: "📊" },
    { title: "Products", desc: "CRUD management, variant editing,\ninventory tracking, featured flags", icon: "📦" },
    { title: "Orders", desc: "Status management, tracking numbers,\npayment status, delivery method", icon: "🛒" },
    { title: "Wholesale", desc: "Inquiry pipeline, status workflow,\nadmin notes, business type filter", icon: "🏢" },
    { title: "Customers", desc: "Registered user list, join dates,\nroles, order history per customer", icon: "👥" },
    { title: "Messages", desc: "Contact form inbox, read/replied\nstatus management", icon: "✉️" },
  ];

  panels.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 4.0;
    const y = 2.4 + row * 2.3;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 3.6, h: 1.9,
      fill: { color: BRAND.white }, rectRadius: 0.12,
      shadow: { type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.1 },
    });
    slide.addText(p.icon, {
      x: x + 0.2, y: y + 0.15, w: 0.6, h: 0.5,
      fontFace: FONT_BODY, fontSize: 24,
    });
    slide.addText(p.title, {
      x: x + 0.8, y: y + 0.15, w: 2.5, h: 0.5,
      fontFace: FONT_DISPLAY, fontSize: 16, color: BRAND.red, bold: true, valign: "middle",
    });
    slide.addText(p.desc, {
      x: x + 0.2, y: y + 0.8, w: 3.2, h: 0.9,
      fontFace: FONT_BODY, fontSize: 11, color: BRAND.muted, lineSpacing: 16,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 9: BRAND IDENTITY
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.white };

  slide.addText("Brand Identity & Design", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  // Color palette
  const colors = [
    { name: "Kem Red", hex: "#C41E1E", color: BRAND.red },
    { name: "Warm Cream", hex: "#FAF0E6", color: BRAND.cream },
    { name: "Soft Gold", hex: "#D4A843", color: BRAND.gold },
    { name: "Earth Green", hex: "#166534", color: BRAND.green },
    { name: "Ink Black", hex: "#1C1917", color: BRAND.ink },
  ];
  slide.addText("Color Palette", {
    x: 0.8, y: 1.7, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  colors.forEach((c, i) => {
    const x = 0.8 + i * 2.3;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y: 2.3, w: 2.0, h: 1.2,
      fill: { color: c.color }, rectRadius: 0.1,
      line: c.color === BRAND.cream ? { color: "DDDDDD", width: 0.5 } : undefined,
    });
    slide.addText(c.name, {
      x, y: 3.55, w: 2.0, h: 0.35,
      fontFace: FONT_BODY, fontSize: 11, color: BRAND.ink, bold: true, align: "center",
    });
    slide.addText(c.hex, {
      x, y: 3.85, w: 2.0, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: BRAND.muted, align: "center",
    });
  });

  // Typography
  slide.addText("Typography", {
    x: 0.8, y: 4.5, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  slide.addText("Playfair Display", {
    x: 0.8, y: 5.1, w: 5, h: 0.6,
    fontFace: FONT_DISPLAY, fontSize: 28, color: BRAND.red, italic: true,
  });
  slide.addText("Headlines — elegant serif matching the campaign deck", {
    x: 0.8, y: 5.6, w: 5, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: BRAND.muted,
  });
  slide.addText("DM Sans — Clean, modern body text", {
    x: 0.8, y: 6.1, w: 5, h: 0.5,
    fontFace: FONT_BODY, fontSize: 16, color: BRAND.ink,
  });

  // Campaign alignment
  slide.addText("Campaign Alignment", {
    x: 7.0, y: 4.5, w: 5, h: 0.5,
    fontFace: FONT_DISPLAY, fontSize: 18, color: BRAND.ink, bold: true,
  });
  const alignment = [
    "Aligned with JEHOFILMS brand deck",
    "Lifestyle-driven imagery & storytelling",
    "Heritage, culture, healthy hydration messaging",
    "Mobile-first responsive design",
    "Instagram/WhatsApp traffic optimized",
  ];
  alignment.forEach((a, i) => {
    slide.addText(`✓  ${a}`, {
      x: 7.0, y: 5.1 + i * 0.4, w: 5.5, h: 0.35,
      fontFace: FONT_BODY, fontSize: 12, color: BRAND.ink,
    });
  });

  if (tropicalImg) {
    slide.addImage({ data: tropicalImg, x: 8.0, y: 1.5, w: 4.5, h: 2.8, rounding: true, sizing: { type: "cover", w: 4.5, h: 2.8 } });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 10: WHAT CAN BE ADDED — PHASE 2
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.cream };

  slide.addText("What Can Be Added — Phase 2", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  const additions = [
    {
      title: "Subscription / Auto-Reorder",
      desc: "\"Never run out\" — monthly delivery subscriptions. Stripe recurring billing. Manage/pause/cancel from dashboard. Subscriber-only pricing.",
      priority: "HIGH",
    },
    {
      title: "Loyalty & Rewards Program",
      desc: "Points per purchase. Referral bonuses (\"Share Zobo, earn credit\"). Tiered rewards (Bronze, Silver, Gold). Birthday discounts.",
      priority: "HIGH",
    },
    {
      title: "Store Locator",
      desc: "Google Maps integration showing retail locations carrying Kem Zobo. Filter by city/state. \"Find near me\" geolocation. Drive foot traffic to wholesale partners.",
      priority: "MED",
    },
    {
      title: "Reviews & Ratings",
      desc: "Customer product reviews with star ratings. Photo reviews. Verified purchase badges. Social proof on product pages.",
      priority: "MED",
    },
    {
      title: "Promo Codes & Flash Sales",
      desc: "Discount code system (% off, fixed amount, free shipping). Limited-time flash sales with countdown timers. First-order discounts.",
      priority: "HIGH",
    },
    {
      title: "SMS Order Updates",
      desc: "Twilio integration for SMS notifications. Order confirmation, shipped, delivered texts. Opt-in at checkout.",
      priority: "LOW",
    },
  ];

  additions.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 1.8 + row * 1.8;

    const prioColor = a.priority === "HIGH" ? BRAND.red : a.priority === "MED" ? BRAND.gold : BRAND.muted;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.8, h: 1.55,
      fill: { color: BRAND.white }, rectRadius: 0.1,
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.08 },
    });
    slide.addText(a.title, {
      x: x + 0.2, y: y + 0.1, w: 4.0, h: 0.4,
      fontFace: FONT_DISPLAY, fontSize: 14, color: BRAND.ink, bold: true,
    });
    slide.addText(a.priority, {
      x: x + 4.5, y: y + 0.1, w: 1.1, h: 0.35,
      fontFace: FONT_BODY, fontSize: 9, color: prioColor, bold: true, align: "center",
      // border doesn't work the same way, using shape below
    });
    slide.addText(a.desc, {
      x: x + 0.2, y: y + 0.55, w: 5.4, h: 0.9,
      fontFace: FONT_BODY, fontSize: 10.5, color: BRAND.muted, lineSpacing: 15,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 11: WHAT CAN BE ADDED — PHASE 3
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.white };

  slide.addText("What Can Be Added — Phase 3", {
    x: 0.8, y: 0.5, w: 11, h: 0.9,
    fontFace: FONT_DISPLAY, fontSize: 36, color: BRAND.red, bold: true,
  });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.3, w: 2.5, h: 0.05, fill: { color: BRAND.red } });

  const advanced = [
    {
      title: "Wholesale Customer Portal",
      desc: "Approved wholesale partners get login access. Custom wholesale pricing visible after approval. Bulk order placement directly through the platform. Order history and reorder capability.",
    },
    {
      title: "Analytics & Insights Dashboard",
      desc: "Google Analytics 4 integration. Sales trends, top products, customer demographics. Revenue by channel (retail vs wholesale). Inventory forecasting based on order velocity.",
    },
    {
      title: "Multi-Channel Sales",
      desc: "Amazon / Walmart marketplace listings sync. Shopify integration bridge. Social commerce (Instagram Shop, TikTok Shop). Unified inventory across all channels.",
    },
    {
      title: "InvoiceForge Integration",
      desc: "Auto-generate invoices for wholesale orders. Payment tracking & receivables. Client CRM with order history. Connected financial system — e-commerce + invoicing in one.",
    },
    {
      title: "Blog & Content Hub",
      desc: "SEO-driven blog with hibiscus health articles, recipes, cultural stories. Newsletter integration. Drives organic traffic from Google. Positions Kem Zobo as a thought leader.",
    },
    {
      title: "Mobile App (PWA)",
      desc: "Progressive Web App — installable on phone. Push notifications for orders & promos. Offline-capable product browsing. Native-app experience without app store listing.",
    },
  ];

  advanced.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.8 + col * 6.2;
    const y = 1.7 + row * 1.8;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 5.8, h: 1.55,
      fill: { color: BRAND.cream }, rectRadius: 0.1,
    });
    slide.addText(a.title, {
      x: x + 0.2, y: y + 0.1, w: 5.4, h: 0.4,
      fontFace: FONT_DISPLAY, fontSize: 14, color: BRAND.red, bold: true,
    });
    slide.addText(a.desc, {
      x: x + 0.2, y: y + 0.55, w: 5.4, h: 0.95,
      fontFace: FONT_BODY, fontSize: 10.5, color: BRAND.muted, lineSpacing: 15,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 12: CLOSING
// ═══════════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: BRAND.red };

  if (logoImg) {
    slide.addImage({ data: logoImg, x: 5.2, y: 0.5, w: 2.8, h: 2.8, sizing: { type: "contain", w: 2.8, h: 2.8 } });
  }

  slide.addText("The Go-To Choice for\nHealthy Hydration", {
    x: 1.5, y: 3.2, w: 10.3, h: 1.5,
    fontFace: FONT_DISPLAY, fontSize: 38, color: BRAND.white, bold: true, align: "center", lineSpacing: 48,
  });

  slide.addText("kemzobo.com", {
    x: 1.5, y: 4.8, w: 10.3, h: 0.6,
    fontFace: FONT_BODY, fontSize: 20, color: BRAND.cream, align: "center",
  });

  slide.addText("Built with ❤ by Concepts WebCraft", {
    x: 1.5, y: 5.6, w: 10.3, h: 0.5,
    fontFace: FONT_BODY, fontSize: 13, color: "FFD4CC", align: "center",
  });

  slide.addText("hello@kemzobo.com  •  (240) 409-2814", {
    x: 1.5, y: 6.2, w: 10.3, h: 0.4,
    fontFace: FONT_BODY, fontSize: 12, color: "FFD4CC", align: "center",
  });
}

// ─── SAVE ─────────────────────────────────────────────────
const outPath = "Kem_Zobo_Platform_Overview.pptx";
await pptx.writeFile({ fileName: outPath });
console.log(`\n✅ Presentation saved: ${outPath}`);
console.log(`   12 slides, widescreen format`);
