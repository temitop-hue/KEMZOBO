import PptxGenJS from "pptxgenjs";

const RED = "B91C1C";
const INK = "111111";
const BODY = "555555";
const LIGHT = "F7F7F7";
const WHITE = "FFFFFF";
const BORDER = "E5E5E5";
const SERIF = "Playfair Display";
const SANS = "DM Sans";

// ═══════════════════════════════════════════════════════════
// CONTRACT
// ═══════════════════════════════════════════════════════════
{
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "LETTER", width: 10, height: 7.5 });
  pptx.layout = "LETTER";
  pptx.title = "KEMZOBO — Service Agreement";

  // ─── SLIDE 1: COVER ─────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: WHITE };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });
    s.addText("Website Development\nAgreement", {
      x: 0.8, y: 1.5, w: 8, h: 1.6, fontFace: SERIF, fontSize: 38, color: INK, bold: true, lineSpacing: 48,
    });
    s.addText("KEMZOBO — THE ORIGINAL ZOBO DRINK", {
      x: 0.8, y: 3.3, w: 8, h: 0.5, fontFace: SANS, fontSize: 14, color: RED, bold: true, italic: true,
    });
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 4.0, w: 2, h: 0.04, fill: { color: RED } });

    const info = [
      ["Agreement #", "CW-KEMZOBO-2026-001"],
      ["Date", "March 28, 2026"],
      ["Client", "Kemi Itayemi — KEMZOBO / Hydrate Nation"],
      ["Developer", "Temi Alade — Concepts WebCraft"],
    ];
    info.forEach((row, i) => {
      s.addText(row[0], { x: 0.8, y: 4.4 + i * 0.45, w: 2.5, h: 0.4, fontFace: SANS, fontSize: 11, color: BODY });
      s.addText(row[1], { x: 3.3, y: 4.4 + i * 0.45, w: 5, h: 0.4, fontFace: SANS, fontSize: 11, color: INK, bold: true });
    });
  }

  // ─── SLIDE 2: SCOPE ─────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: WHITE };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });
    s.addText("Scope of Work", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontFace: SERIF, fontSize: 24, color: RED, bold: true });

    const scope = [
      "23 custom pages (public, auth, customer, admin)",
      "Full e-commerce: cart, Stripe checkout, order management",
      "Product variant system (Single Can, 6-Pack, Case of 24)",
      "Dynamic bulk pricing with live discount display",
      "Inventory management with low-stock alerts",
      "Wholesale inquiry portal with admin pipeline",
      "Email/password authentication + password reset",
      "Brevo email system (order confirmations, resets)",
      "Newsletter / email capture with subscriber database",
      "Admin dashboard (6 panels: products, orders, wholesale, customers, messages, stats)",
      "Custom brand design aligned with campaign brief",
      "Mobile-first responsive, SEO optimized",
      "1 year FREE hosting + domain + SSL",
    ];
    scope.forEach((item, i) => {
      s.addText(`✓  ${item}`, {
        x: 0.8, y: 1.2 + i * 0.42, w: 8.5, h: 0.38, fontFace: SANS, fontSize: 11, color: INK,
      });
    });
  }

  // ─── SLIDE 3: PAYMENT ───────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: WHITE };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });
    s.addText("Payment Terms — Option C", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontFace: SERIF, fontSize: 24, color: RED, bold: true });

    // Payment table
    const payments = [
      ["Deposit", "On signing this agreement", "$1,000.00"],
      ["Milestone 1", "After homepage is reviewed & approved", "$400.00"],
      ["Final Payment", "On site launch at kemzobo.com", "$400.00"],
    ];

    // Header
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 1.3, w: 8.4, h: 0.5, fill: { color: INK }, rectRadius: 0.05 });
    s.addText("Payment", { x: 1.0, y: 1.3, w: 2.2, h: 0.5, fontFace: SANS, fontSize: 11, color: WHITE, bold: true, valign: "middle" });
    s.addText("Milestone", { x: 3.2, y: 1.3, w: 3.8, h: 0.5, fontFace: SANS, fontSize: 11, color: WHITE, bold: true, valign: "middle" });
    s.addText("Amount", { x: 7.2, y: 1.3, w: 1.8, h: 0.5, fontFace: SANS, fontSize: 11, color: WHITE, bold: true, valign: "middle", align: "right" });

    payments.forEach((row, i) => {
      const y = 1.85 + i * 0.5;
      s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y, w: 8.4, h: 0.45, fill: { color: i % 2 === 0 ? LIGHT : WHITE } });
      s.addText(row[0], { x: 1.0, y, w: 2.2, h: 0.45, fontFace: SANS, fontSize: 11, color: INK, bold: true, valign: "middle" });
      s.addText(row[1], { x: 3.2, y, w: 3.8, h: 0.45, fontFace: SANS, fontSize: 11, color: BODY, valign: "middle" });
      s.addText(row[2], { x: 7.2, y, w: 1.8, h: 0.45, fontFace: SANS, fontSize: 11, color: INK, bold: true, valign: "middle", align: "right" });
    });

    // Total
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 3.4, w: 8.4, h: 0.5, fill: { color: RED } });
    s.addText("Total Project Fee", { x: 1.0, y: 3.4, w: 5, h: 0.5, fontFace: SANS, fontSize: 12, color: WHITE, bold: true, valign: "middle" });
    s.addText("$1,800.00", { x: 7.2, y: 3.4, w: 1.8, h: 0.5, fontFace: SANS, fontSize: 14, color: WHITE, bold: true, valign: "middle", align: "right" });

    // Payment method
    s.addText("Payment Method", { x: 0.8, y: 4.3, w: 4, h: 0.5, fontFace: SERIF, fontSize: 18, color: INK, bold: true });
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 4.9, w: 8.4, h: 1.0, fill: { color: LIGHT }, rectRadius: 0.1 });
    s.addText("Zelle", { x: 1.2, y: 5.0, w: 2, h: 0.35, fontFace: SANS, fontSize: 14, color: INK, bold: true });
    s.addText("Send to: temitop@gmail.com", { x: 1.2, y: 5.4, w: 5, h: 0.35, fontFace: SANS, fontSize: 12, color: BODY });
    s.addText('Memo: "KEMZOBO"', { x: 5.5, y: 5.4, w: 3, h: 0.35, fontFace: SANS, fontSize: 12, color: BODY });

    // Monthly retainer
    s.addText("Monthly Retainer — Essential Plan", { x: 0.8, y: 6.2, w: 5, h: 0.4, fontFace: SERIF, fontSize: 16, color: INK, bold: true });
    s.addText("$150/month — Hosting, domain, SSL, monitoring, security updates, bug fixes, up to 3 content changes/mo, 48hr email support, monthly backups. Starts the month after launch.", {
      x: 0.8, y: 6.6, w: 8.4, h: 0.6, fontFace: SANS, fontSize: 10, color: BODY, lineSpacing: 15,
    });
  }

  // ─── SLIDE 4: TERMS ────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: WHITE };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });
    s.addText("Terms & Conditions", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontFace: SERIF, fontSize: 24, color: RED, bold: true });

    const terms = [
      "Work commences upon receipt of the $1,000.00 deposit.",
      "Client will review and provide feedback within 7 business days of each milestone notification.",
      "Final payment is due before the site is deployed to the live domain (kemzobo.com).",
      "Upon full payment ($1,800.00), the Client owns all website code, content, and design files.",
      "The Developer retains the right to display this project in the Concepts WebCraft portfolio.",
      "All payments are non-refundable for completed work.",
      "Additional features beyond the defined scope will be quoted separately.",
      "Third-party services (Stripe, cloud hosting, Brevo) are subject to their own terms and pricing.",
      "Hosting renewal: $120/year after the first free year. Domain renewal: $15/year.",
      "Monthly retainer can be cancelled with 30 days written notice by either party.",
      "Strategy consulting (discussions & planning) is included. Implementation is scoped separately.",
      "This agreement constitutes the entire understanding. Amendments require written consent from both parties.",
    ];
    terms.forEach((t, i) => {
      s.addText(`${i + 1}.  ${t}`, {
        x: 0.8, y: 1.2 + i * 0.44, w: 8.4, h: 0.4, fontFace: SANS, fontSize: 10.5, color: INK, lineSpacing: 14,
      });
    });
  }

  // ─── SLIDE 5: SIGNATURES ────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: WHITE };
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });
    s.addText("Signatures", { x: 0.8, y: 0.4, w: 8, h: 0.6, fontFace: SERIF, fontSize: 24, color: RED, bold: true });

    s.addText("By signing below, both parties agree to the terms and conditions outlined in this agreement.", {
      x: 0.8, y: 1.2, w: 8.4, h: 0.5, fontFace: SANS, fontSize: 12, color: BODY,
    });

    // Client
    s.addText("CLIENT", { x: 0.8, y: 2.2, w: 4, h: 0.4, fontFace: SANS, fontSize: 10, color: RED, bold: true });
    s.addText("Kemi Itayemi — KEMZOBO / Hydrate Nation", { x: 0.8, y: 2.6, w: 4, h: 0.35, fontFace: SANS, fontSize: 12, color: INK });
    s.addText("hydrate-nation@outlook.com", { x: 0.8, y: 2.95, w: 4, h: 0.3, fontFace: SANS, fontSize: 10, color: BODY });
    s.addText("Signature:", { x: 0.8, y: 3.6, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 11, color: BODY });
    s.addShape(pptx.shapes.RECTANGLE, { x: 2.3, y: 3.7, w: 4, h: 0.02, fill: { color: BORDER } });
    s.addText("Date:", { x: 0.8, y: 4.2, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 11, color: BODY });
    s.addShape(pptx.shapes.RECTANGLE, { x: 2.3, y: 4.3, w: 2.5, h: 0.02, fill: { color: BORDER } });

    // Developer
    s.addText("DEVELOPER", { x: 0.8, y: 5.2, w: 4, h: 0.4, fontFace: SANS, fontSize: 10, color: RED, bold: true });
    s.addText("Temi Alade — Concepts WebCraft", { x: 0.8, y: 5.6, w: 4, h: 0.35, fontFace: SANS, fontSize: 12, color: INK });
    s.addText("hello@conceptswebcraft.com", { x: 0.8, y: 5.95, w: 4, h: 0.3, fontFace: SANS, fontSize: 10, color: BODY });
    s.addText("Signature:", { x: 0.8, y: 6.5, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 11, color: BODY });
    s.addShape(pptx.shapes.RECTANGLE, { x: 2.3, y: 6.6, w: 4, h: 0.02, fill: { color: BORDER } });
    s.addText("Date:", { x: 0.8, y: 7.0, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 11, color: BODY });
    s.addShape(pptx.shapes.RECTANGLE, { x: 2.3, y: 7.1, w: 2.5, h: 0.02, fill: { color: BORDER } });
  }

  await pptx.writeFile({ fileName: "KEMZOBO_Contract_v2.pptx" });
  console.log("✅ Contract saved: KEMZOBO_Contract_v2.pptx (5 slides)");
}

// ═══════════════════════════════════════════════════════════
// INVOICE
// ═══════════════════════════════════════════════════════════
{
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "LETTER", width: 10, height: 7.5 });
  pptx.layout = "LETTER";
  pptx.title = "KEMZOBO — Invoice #001";

  const s = pptx.addSlide();
  s.background = { color: WHITE };

  // Red top bar
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: RED } });

  // Header
  s.addText("INVOICE", { x: 0.8, y: 0.4, w: 4, h: 0.7, fontFace: SERIF, fontSize: 32, color: RED, bold: true });

  // Invoice details (right side)
  const details = [
    ["Invoice #", "INV-KEMZOBO-001"],
    ["Date", "March 28, 2026"],
    ["Due", "Upon Receipt"],
    ["Status", "DUE"],
  ];
  details.forEach((row, i) => {
    s.addText(row[0], { x: 6.5, y: 0.4 + i * 0.35, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 10, color: BODY, align: "right" });
    s.addText(row[1], { x: 8.2, y: 0.4 + i * 0.35, w: 1.5, h: 0.3, fontFace: SANS, fontSize: 10, color: INK, bold: true });
  });

  // From / Bill To
  s.addText("FROM", { x: 0.8, y: 1.8, w: 4, h: 0.3, fontFace: SANS, fontSize: 9, color: RED, bold: true });
  s.addText("Concepts WebCraft\nTemi Alade\nhello@conceptswebcraft.com", {
    x: 0.8, y: 2.1, w: 4, h: 0.9, fontFace: SANS, fontSize: 10, color: BODY, lineSpacing: 16,
  });

  s.addText("BILL TO", { x: 5.5, y: 1.8, w: 4, h: 0.3, fontFace: SANS, fontSize: 9, color: RED, bold: true });
  s.addText("Kemi Itayemi\nKEMZOBO / Hydrate Nation\nhydrate-nation@outlook.com\n(240) 409-2814", {
    x: 5.5, y: 2.1, w: 4, h: 1.1, fontFace: SANS, fontSize: 10, color: BODY, lineSpacing: 16,
  });

  // Line items header
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 3.5, w: 8.4, h: 0.45, fill: { color: INK }, rectRadius: 0.05 });
  s.addText("Description", { x: 1.0, y: 3.5, w: 6, h: 0.45, fontFace: SANS, fontSize: 10, color: WHITE, bold: true, valign: "middle" });
  s.addText("Amount", { x: 7.5, y: 3.5, w: 1.5, h: 0.45, fontFace: SANS, fontSize: 10, color: WHITE, bold: true, valign: "middle", align: "right" });

  // Line item
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 4.0, w: 8.4, h: 1.0, fill: { color: LIGHT } });
  s.addText("KEMZOBO — Custom E-Commerce Website\nDeposit Payment (Payment 1 of 3, Option C)\n23 pages, Stripe payments, admin dashboard, wholesale portal, brand design", {
    x: 1.0, y: 4.05, w: 6, h: 0.9, fontFace: SANS, fontSize: 10, color: INK, lineSpacing: 15,
  });
  s.addText("$1,000.00", { x: 7.5, y: 4.0, w: 1.5, h: 1.0, fontFace: SANS, fontSize: 13, color: INK, bold: true, valign: "middle", align: "right" });

  // Total
  s.addShape(pptx.shapes.RECTANGLE, { x: 5.8, y: 5.2, w: 3.4, h: 0.5, fill: { color: RED } });
  s.addText("AMOUNT DUE", { x: 6.0, y: 5.2, w: 1.5, h: 0.5, fontFace: SANS, fontSize: 11, color: WHITE, bold: true, valign: "middle" });
  s.addText("$1,000.00", { x: 7.5, y: 5.2, w: 1.5, h: 0.5, fontFace: SERIF, fontSize: 18, color: WHITE, bold: true, valign: "middle", align: "right" });

  // Payment method
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.8, y: 5.9, w: 8.4, h: 0.8, fill: { color: LIGHT }, rectRadius: 0.1 });
  s.addText("Pay via Zelle:", { x: 1.2, y: 6.0, w: 2, h: 0.3, fontFace: SANS, fontSize: 11, color: INK, bold: true });
  s.addText("temitop@gmail.com", { x: 3.2, y: 6.0, w: 3, h: 0.3, fontFace: SANS, fontSize: 12, color: RED, bold: true });
  s.addText('Memo: "KEMZOBO Deposit — INV-KEMZOBO-001"', { x: 1.2, y: 6.35, w: 6, h: 0.3, fontFace: SANS, fontSize: 10, color: BODY });

  // Footer
  s.addText("Thank you for your business!", { x: 0.8, y: 7.0, w: 4, h: 0.3, fontFace: SANS, fontSize: 10, color: BODY, italic: true });

  await pptx.writeFile({ fileName: "KEMZOBO_Invoice_001_v2.pptx" });
  console.log("✅ Invoice saved: KEMZOBO_Invoice_001_v2.pptx (1 slide)");
}
