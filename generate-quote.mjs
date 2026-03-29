import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

const RED = "B91C1C";
const INK = "111111";
const BODY = "555555";
const LIGHT = "F7F7F7";
const WHITE = "FFFFFF";
const BORDER = "E5E5E5";

const SERIF = "Playfair Display";
const SANS = "DM Sans";

pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Concepts WebCraft";
pptx.title = "KEMZOBO — Website Development Quote";

// ─── Helpers ──────────────────────────────────────────────
function addHeader(slide, title, subtitle) {
  slide.addText(title, { x: 0.8, y: 0.5, w: 11, h: 0.8, fontFace: SERIF, fontSize: 32, color: RED, bold: true });
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 1.2, w: 2, h: 0.04, fill: { color: RED } });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.8, y: 1.5, w: 11, h: 0.5, fontFace: SANS, fontSize: 13, color: BODY, italic: true });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 1: TITLE
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  s.addText("KEMZOBO", { x: 0.8, y: 1.5, w: 11, h: 1.2, fontFace: SERIF, fontSize: 52, color: RED, bold: true });
  s.addText("Website Development Quote\n& Retainer Agreement", { x: 0.8, y: 2.8, w: 8, h: 1.0, fontFace: SERIF, fontSize: 26, color: INK, lineSpacing: 36 });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 4.0, w: 3, h: 0.04, fill: { color: RED } });
  s.addText("Prepared by: Concepts WebCraft\nPrepared for: Kemi Itayemi — KEMZOBO\nDate: March 28, 2026\nValid for: 30 Days", {
    x: 0.8, y: 4.4, w: 6, h: 1.5, fontFace: SANS, fontSize: 13, color: BODY, lineSpacing: 22,
  });
  s.addText("conceptswebcraft.com", { x: 0.8, y: 6.5, w: 6, h: 0.4, fontFace: SANS, fontSize: 11, color: BODY });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 2: WHAT WE BUILT
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "What We Built", "Custom e-commerce platform — not a template");

  const items = [
    "23 pages (public, auth, customer, admin)",
    "Full shopping cart + Stripe Elements checkout",
    "Product variant system (Single, 6-Pack, Case of 24)",
    "Dynamic bulk pricing with live discount feedback",
    "Wholesale inquiry portal with admin pipeline",
    "Inventory management with low-stock alerts",
    "Email system (order confirmations, password resets)",
    "Newsletter / email capture system",
    "Admin dashboard (products, orders, wholesale, customers, messages)",
    "Custom brand design system (Playfair Display + DM Sans)",
    "Mobile-first responsive design",
    "SEO setup (meta tags, JSON-LD structured data)",
    "Social proof / testimonials section",
    "Micro-interactions (hover effects, scroll animations)",
  ];
  items.forEach((item, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    s.addText(`✓  ${item}`, {
      x: 0.8 + col * 6, y: 2.1 + row * 0.55, w: 5.8, h: 0.5,
      fontFace: SANS, fontSize: 12, color: INK,
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 3: TECH STACK
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "Technology Stack", "Enterprise-grade infrastructure");

  const stack = [
    ["Frontend", "React 19, TypeScript, Tailwind CSS v4, Framer Motion"],
    ["Backend", "Express.js, tRPC v11 (30+ type-safe API endpoints)"],
    ["Database", "TiDB Cloud (MySQL), Drizzle ORM, 9 tables"],
    ["Payments", "Stripe Elements + Webhooks"],
    ["Email", "Brevo (transactional emails)"],
    ["Auth", "JWT + httpOnly cookies, scrypt password hashing"],
    ["Hosting", "Railway (target deployment)"],
  ];
  stack.forEach((row, i) => {
    const y = 2.0 + i * 0.6;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 11.5, h: 0.5, fill: { color: i % 2 === 0 ? LIGHT : WHITE }, rectRadius: 0.05 });
    s.addText(row[0], { x: 1.0, y, w: 2.2, h: 0.5, fontFace: SANS, fontSize: 12, color: RED, bold: true, valign: "middle" });
    s.addText(row[1], { x: 3.4, y, w: 8.8, h: 0.5, fontFace: SANS, fontSize: 11, color: BODY, valign: "middle" });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 4: PRICING
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "Project Investment");

  // Main price
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 2.0, w: 5.5, h: 3.5, fill: { color: LIGHT }, rectRadius: 0.15 });
  s.addText("Custom E-Commerce Platform", { x: 1.2, y: 2.2, w: 4.8, h: 0.5, fontFace: SERIF, fontSize: 18, color: INK, bold: true });
  s.addText("23 pages • 30+ API endpoints • 9 database tables", { x: 1.2, y: 2.7, w: 4.8, h: 0.4, fontFace: SANS, fontSize: 11, color: BODY });

  s.addText("$3,500", { x: 1.2, y: 3.3, w: 4.8, h: 0.8, fontFace: SERIF, fontSize: 44, color: RED, bold: true });

  const included = ["Stripe payments", "Product variants + inventory", "Wholesale portal", "Admin dashboard", "Email system", "Newsletter capture", "1 year hosting + domain FREE", "SSL certificate FREE"];
  included.forEach((item, i) => {
    s.addText(`✓  ${item}`, { x: 1.2, y: 4.2 + i * 0.3, w: 4.8, h: 0.28, fontFace: SANS, fontSize: 10, color: BODY });
  });

  // Payment options
  s.addText("Payment Options", { x: 7.0, y: 2.0, w: 5, h: 0.5, fontFace: SERIF, fontSize: 18, color: INK, bold: true });

  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.0, y: 2.7, w: 5.3, h: 1.3, fill: { color: LIGHT }, rectRadius: 0.1 });
  s.addText("Option A: Two Payments", { x: 7.3, y: 2.8, w: 4.8, h: 0.35, fontFace: SANS, fontSize: 13, color: INK, bold: true });
  s.addText("50% upfront ($1,750)\n50% on launch ($1,750)", { x: 7.3, y: 3.2, w: 4.8, h: 0.7, fontFace: SANS, fontSize: 11, color: BODY, lineSpacing: 18 });

  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.0, y: 4.2, w: 5.3, h: 1.5, fill: { color: LIGHT }, rectRadius: 0.1 });
  s.addText("Option B: Three Payments", { x: 7.3, y: 4.3, w: 4.8, h: 0.35, fontFace: SANS, fontSize: 13, color: INK, bold: true });
  s.addText("Deposit: $1,200\nAfter homepage approved: $1,200\nOn launch: $1,100", { x: 7.3, y: 4.7, w: 4.8, h: 0.9, fontFace: SANS, fontSize: 11, color: BODY, lineSpacing: 18 });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 5: MONTHLY RETAINER
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "Monthly Retainer Plans", "Ongoing support, updates, and growth");

  const plans = [
    {
      name: "Essential",
      price: "$150/mo",
      items: ["Hosting & domain", "SSL certificate", "Uptime monitoring", "Security updates", "Up to 3 content changes/mo", "48hr email support", "Monthly backup"],
      color: LIGHT,
    },
    {
      name: "Growth",
      price: "$350/mo",
      items: ["Everything in Essential +", "Priority 24hr support", "Unlimited content updates", "Monthly analytics report", "SEO monitoring", "4 hrs/mo new features", "2 email campaigns/mo"],
      color: LIGHT,
    },
    {
      name: "Premium",
      price: "$600/mo",
      items: ["Everything in Growth +", "Same-day support", "10 hrs/mo new features", "A/B testing", "Advanced analytics", "Multi-channel sync", "Loyalty/subscription setup"],
      color: RED,
      textColor: WHITE,
    },
  ];

  plans.forEach((plan, pi) => {
    const x = 0.8 + pi * 4.1;
    const isRed = plan.color === RED;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x, y: 2.0, w: 3.8, h: 5.0, fill: { color: plan.color }, rectRadius: 0.15 });
    s.addText(plan.name, { x: x + 0.3, y: 2.2, w: 3.2, h: 0.5, fontFace: SERIF, fontSize: 20, color: isRed ? WHITE : INK, bold: true });
    s.addText(plan.price, { x: x + 0.3, y: 2.7, w: 3.2, h: 0.6, fontFace: SERIF, fontSize: 28, color: isRed ? WHITE : RED, bold: true });
    plan.items.forEach((item, i) => {
      s.addText(`•  ${item}`, { x: x + 0.3, y: 3.5 + i * 0.42, w: 3.2, h: 0.38, fontFace: SANS, fontSize: 10.5, color: isRed ? "FFFFFF" : BODY });
    });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 6: ADD-ONS
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "Future Add-Ons", "Available anytime as your business grows");

  const addons = [
    ["Subscription / Auto-Reorder", "$500"],
    ["Loyalty & Rewards Program", "$400"],
    ["Store Locator (Google Maps)", "$250"],
    ["Customer Reviews & Ratings", "$300"],
    ["Promo Codes & Flash Sales", "$200"],
    ["SMS Order Updates (Twilio)", "$300"],
    ["Blog / Content Hub", "$350"],
    ["Wholesale Customer Portal", "$500"],
    ["Progressive Web App (PWA)", "$400"],
    ["Advanced Analytics Dashboard", "$350"],
  ];

  addons.forEach((row, i) => {
    const y = 2.0 + i * 0.48;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y, w: 11.5, h: 0.42, fill: { color: i % 2 === 0 ? LIGHT : WHITE }, rectRadius: 0.05 });
    s.addText(row[0], { x: 1.2, y, w: 8, h: 0.42, fontFace: SANS, fontSize: 12, color: INK, valign: "middle" });
    s.addText(row[1], { x: 9.5, y, w: 2.5, h: 0.42, fontFace: SANS, fontSize: 12, color: RED, bold: true, valign: "middle", align: "right" });
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 7: TIMELINE
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  addHeader(s, "Timeline to Launch");

  const steps = [
    { phase: "Development", status: "✓ Complete", desc: "Full platform built and functional" },
    { phase: "Client Review", status: "1 Week", desc: "Feedback, content swaps, copy refinements" },
    { phase: "Stripe Setup", status: "1-2 Days", desc: "Connect live Stripe keys, test payments" },
    { phase: "Deploy", status: "1 Day", desc: "Railway hosting, kemzobo.com domain connection" },
    { phase: "Launch", status: "Live", desc: "Site live at kemzobo.com" },
  ];

  steps.forEach((step, i) => {
    const y = 2.2 + i * 0.9;
    // Circle
    s.addShape(pptx.shapes.OVAL, { x: 1.0, y: y + 0.1, w: 0.5, h: 0.5, fill: { color: i === 0 || i === 4 ? RED : LIGHT }, line: { color: RED, width: 1.5 } });
    s.addText(String(i + 1), { x: 1.0, y: y + 0.1, w: 0.5, h: 0.5, fontFace: SANS, fontSize: 11, color: i === 0 || i === 4 ? WHITE : RED, bold: true, align: "center", valign: "middle" });
    // Line
    if (i < 4) {
      s.addShape(pptx.shapes.RECTANGLE, { x: 1.22, y: y + 0.6, w: 0.06, h: 0.35, fill: { color: BORDER } });
    }
    // Text
    s.addText(step.phase, { x: 2.0, y, w: 2.5, h: 0.4, fontFace: SANS, fontSize: 14, color: INK, bold: true, valign: "middle" });
    s.addText(step.status, { x: 4.5, y, w: 2, h: 0.4, fontFace: SANS, fontSize: 13, color: RED, bold: true, valign: "middle" });
    s.addText(step.desc, { x: 2.0, y: y + 0.35, w: 6, h: 0.35, fontFace: SANS, fontSize: 11, color: BODY });
  });

  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 7.5, y: 2.2, w: 5, h: 2.5, fill: { color: RED }, rectRadius: 0.15 });
  s.addText("Ready to Launch\nWithin 2 Weeks\nof Approval", {
    x: 7.8, y: 2.5, w: 4.4, h: 2.0, fontFace: SERIF, fontSize: 24, color: WHITE, bold: true, align: "center", valign: "middle", lineSpacing: 34,
  });
}

// ═══════════════════════════════════════════════════════════
// SLIDE 8: NEXT STEPS
// ═══════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: RED };

  s.addText("Next Steps", { x: 0.8, y: 1.5, w: 11, h: 0.8, fontFace: SERIF, fontSize: 40, color: WHITE, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.3, w: 2, h: 0.04, fill: { color: WHITE } });

  const steps = [
    "Review this quote and select payment option (A or B)",
    "Select a retainer plan (Essential, Growth, or Premium)",
    "Sign and return this agreement",
    "Provide deposit to begin the launch process",
    "Provide Stripe live keys and remaining assets",
    "We launch ✓",
  ];
  steps.forEach((step, i) => {
    s.addText(`${i + 1}.  ${step}`, {
      x: 0.8, y: 2.8 + i * 0.55, w: 10, h: 0.5,
      fontFace: SANS, fontSize: 15, color: WHITE,
    });
  });

  s.addText("Concepts WebCraft", { x: 0.8, y: 6.0, w: 11, h: 0.4, fontFace: SERIF, fontSize: 16, color: WHITE, bold: true });
  s.addText("hello@conceptswebcraft.com  •  conceptswebcraft.com", { x: 0.8, y: 6.4, w: 11, h: 0.4, fontFace: SANS, fontSize: 12, color: "FFD4CC" });
}

const outPath = "KEMZOBO_Quote_and_Retainer.pptx";
await pptx.writeFile({ fileName: outPath });
console.log(`\n✅ Quote saved: ${outPath} (8 slides)`);
