/**
 * Owner notification emails — daily digest + low-stock alerts.
 * Driven by the cron loop in cron.ts.
 */
import * as db from "./db";
import { sendEmail } from "./_core/email";
import { ENV } from "./_core/env";

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Daily digest ─────────────────────────────────────────
let lastDigestDate: string | null = null;
const DIGEST_HOUR = 8; // 8 AM server time

export async function sendDailyDigest(force = false): Promise<{ sent: boolean; reason?: string }> {
  const now = new Date();
  const today = todayDateOnly();

  if (!force) {
    if (now.getUTCHours() !== DIGEST_HOUR) {
      return { sent: false, reason: "not-digest-hour" };
    }
    if (lastDigestDate === today) {
      return { sent: false, reason: "already-sent-today" };
    }
  }
  if (!ENV.ownerEmail) return { sent: false, reason: "no-owner-email" };

  // Build the day's snapshot
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date(yesterday);
  todayStart.setUTCDate(todayStart.getUTCDate() + 1);

  const allOrders = await db.getAllOrders();
  const yOrders = allOrders.filter((o) => {
    if (!o.createdAt) return false;
    const t = new Date(o.createdAt);
    return t >= yesterday && t < todayStart;
  });
  const yPaid = yOrders.filter((o) => o.paymentStatus === "paid");
  const revenue = yPaid.reduce((s, o) => s + (o.total ?? 0), 0);

  const fulfillment = allOrders.filter(
    (o) =>
      o.paymentStatus === "paid" &&
      (o.status === "pending" || o.status === "processing" || o.status === "packed")
  );
  const toPack = fulfillment.filter((o) => o.status !== "packed").length;
  const toShip = fulfillment.filter((o) => o.status === "packed").length;

  const lowStock = await db.getLowStockItems();
  const lowStockRows = await Promise.all(
    lowStock.map(async (i) => {
      const product = await db.getProductById(i.productId);
      const variant = await db.getVariantById(i.variantId);
      return {
        product: product?.name ?? "Unknown",
        variant: variant?.name ?? "Unknown",
        qty: i.quantityAvailable ?? 0,
        threshold: i.lowStockThreshold ?? 10,
      };
    })
  );

  const dateLabel = yesterday.toISOString().slice(0, 10);
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="font-family:Georgia,serif;color:#CC2936;margin:0 0 8px 0">KEMZOBO daily digest</h1>
      <p style="color:#666;margin:0 0 24px 0">${dateLabel}</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="padding:16px;background:#FDF2F2;border-radius:8px;text-align:center;width:33%">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Revenue</div>
            <div style="font-size:28px;font-weight:bold;color:#CC2936;font-family:Georgia,serif">$${dollars(revenue)}</div>
          </td>
          <td style="width:8px"></td>
          <td style="padding:16px;background:#FDF2F2;border-radius:8px;text-align:center;width:33%">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Orders</div>
            <div style="font-size:28px;font-weight:bold;color:#CC2936;font-family:Georgia,serif">${yOrders.length}</div>
          </td>
          <td style="width:8px"></td>
          <td style="padding:16px;background:#FDF2F2;border-radius:8px;text-align:center;width:33%">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888">Paid</div>
            <div style="font-size:28px;font-weight:bold;color:#CC2936;font-family:Georgia,serif">${yPaid.length}</div>
          </td>
        </tr>
      </table>

      <h2 style="font-family:Georgia,serif;color:#0f0806;font-size:16px;margin:24px 0 8px 0">Fulfillment queue</h2>
      <p style="font-size:14px;color:#333;margin:0">
        ${toPack} order${toPack === 1 ? "" : "s"} to pack &middot; ${toShip} ready to ship
      </p>
      ${fulfillment.length > 0
        ? `<p style="margin-top:8px"><a href="https://kemzobo.com/admin/fulfillment" style="color:#CC2936;font-size:13px">Open fulfillment queue →</a></p>`
        : ""}

      <h2 style="font-family:Georgia,serif;color:#0f0806;font-size:16px;margin:24px 0 8px 0">Low stock</h2>
      ${lowStockRows.length === 0
        ? `<p style="font-size:14px;color:#333;margin:0">All variants above threshold ✓</p>`
        : `<table style="width:100%;border-collapse:collapse;font-size:13px">
            ${lowStockRows
              .map(
                (r) => `<tr style="border-bottom:1px solid #eee">
                  <td style="padding:8px 0">${r.product} <span style="color:#888">(${r.variant})</span></td>
                  <td style="padding:8px 0;text-align:right;color:#CC2936;font-weight:bold">${r.qty} left</td>
                </tr>`
              )
              .join("")}
          </table>
          <p style="margin-top:8px"><a href="https://kemzobo.com/admin/inventory" style="color:#CC2936;font-size:13px">Restock now →</a></p>`}

      <p style="margin-top:32px;font-size:12px;color:#888">
        You're receiving this because you're an owner of kemzobo.com.
        Sent daily at ${DIGEST_HOUR}:00 UTC.
      </p>
    </div>
  `;

  await sendEmail({
    to: ENV.ownerEmail,
    subject: `KEMZOBO daily — ${dateLabel} · $${dollars(revenue)} · ${yOrders.length} orders`,
    content: `Daily digest for ${dateLabel}: $${dollars(revenue)} revenue, ${yOrders.length} orders (${yPaid.length} paid). Fulfillment: ${toPack} to pack, ${toShip} to ship. Low stock: ${lowStockRows.length} variants.`,
    html,
  });
  lastDigestDate = today;
  return { sent: true };
}

// ─── Abandoned cart recovery ─────────────────────────────
const ABANDONED_REMINDER_HOURS = 24; // send reminder 24h after order creation
const ABANDONED_CANCEL_HOURS = 48; // cron cancels at 48h, so we have a 24h window

/**
 * Sweep orders that are pending+unpaid, between 24h and 48h old, with no
 * reminder sent yet. For each, send the customer a "you left this in your
 * cart" email with their items and a CTA to come back and finish.
 */
export async function sendAbandonedCartReminders(): Promise<{ sent: number }> {
  const now = Date.now();
  const reminderCutoff = new Date(now - ABANDONED_REMINDER_HOURS * 60 * 60 * 1000);
  const cancelCutoff = new Date(now - ABANDONED_CANCEL_HOURS * 60 * 60 * 1000);

  const all = await db.getAllOrders();
  const candidates = all.filter(
    (o) =>
      o.status === "pending" &&
      o.paymentStatus === "unpaid" &&
      o.abandonedReminderSentAt == null &&
      o.createdAt != null &&
      new Date(o.createdAt) < reminderCutoff &&
      new Date(o.createdAt) > cancelCutoff &&
      !!o.customerEmail
  );

  let sent = 0;
  for (const order of candidates) {
    try {
      const items = await db.getOrderItemsByOrderId(order.id);
      const itemsHtml = items
        .map(
          (it) => `<tr>
            <td style="padding:6px 0">${it.productName} <span style="color:#888">(${it.variantName})</span></td>
            <td style="padding:6px 0;text-align:right;color:#888">×${it.quantity}</td>
            <td style="padding:6px 0;text-align:right">$${dollars(it.unitPrice * it.quantity)}</td>
          </tr>`
        )
        .join("");

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h1 style="font-family:Georgia,serif;color:#CC2936;margin:0 0 4px 0">You left some KEMZOBO behind.</h1>
          <p style="color:#666;margin:0 0 24px 0">
            We're holding your order — but only for a short while. Finish checking out and we'll get it shipped.
          </p>

          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">
            ${itemsHtml}
            <tr style="border-top:1px solid #eee">
              <td colspan="2" style="padding:8px 0;text-align:right;color:#888">Total</td>
              <td style="padding:8px 0;text-align:right;font-weight:bold;color:#CC2936">$${dollars(order.total)}</td>
            </tr>
          </table>

          <p style="margin:24px 0">
            <a href="https://kemzobo.com/products"
               style="display:inline-block;background:#CC2936;color:#fff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:bold;letter-spacing:1.5px;font-size:14px">
              FINISH YOUR ORDER
            </a>
          </p>

          <p style="font-size:13px;color:#666">
            If you've changed your mind that's totally fine — your order will expire on its own in 24 hours.
            Questions? Just reply to this email.
          </p>
        </div>
      `;

      const ok = await sendEmail({
        to: order.customerEmail,
        bcc: ENV.ownerEmail || undefined,
        subject: `Don't forget your KEMZOBO — order ${order.orderNumber}`,
        content: `Your order ${order.orderNumber} is waiting at $${dollars(order.total)}. Finish checking out at https://kemzobo.com/products`,
        html,
      });

      if (ok) {
        await db.updateOrder(order.id, { abandonedReminderSentAt: new Date() } as any);
        sent++;
      }
    } catch (err) {
      console.error(`[Abandoned-cart] Failed for order ${order.orderNumber}:`, err);
    }
  }
  return { sent };
}

// ─── Back-in-stock notifications ─────────────────────────
/**
 * Stock just crossed 0 -> positive. Email everyone who subscribed for this
 * variant, then mark each subscription as notified so they don't get spammed
 * if it goes out and back in again.
 */
export async function sendBackInStockEmails(args: { productId: number; variantId: number }) {
  const subs = await db.getPendingBackInStockSubs(args.variantId);
  if (subs.length === 0) return;

  const product = await db.getProductById(args.productId);
  const variant = await db.getVariantById(args.variantId);
  if (!product || !variant) return;

  const link = `https://kemzobo.com/products/${product.slug}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h1 style="font-family:Georgia,serif;color:#CC2936;margin:0 0 8px 0">It's back.</h1>
      <p style="font-size:15px;color:#333">
        <strong>${product.name}</strong> (${variant.name}) is back in stock.
        Stock moves fast — grab yours before it sells out again.
      </p>
      <p style="margin:24px 0">
        <a href="${link}"
           style="display:inline-block;background:#CC2936;color:#fff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:bold;letter-spacing:1.5px;font-size:14px">
          SHOP NOW
        </a>
      </p>
      <p style="font-size:12px;color:#888">You're receiving this because you signed up for back-in-stock alerts on kemzobo.com. We won't email you again about this item.</p>
    </div>
  `;

  const notified: number[] = [];
  for (const sub of subs) {
    const ok = await sendEmail({
      to: sub.email,
      subject: `Back in stock — ${product.name} (${variant.name})`,
      content: `${product.name} (${variant.name}) is back in stock. Shop now: ${link}`,
      html,
    }).catch((err) => {
      console.error("[Back-in-stock email] failed for", sub.email, err);
      return false;
    });
    if (ok) notified.push(sub.id);
  }
  await db.markBackInStockNotified(notified);
}

// ─── Low-stock crossing alerts ───────────────────────────
/**
 * Called from db.adjustInventory whenever a stock change brings a variant
 * AT or BELOW its threshold (and the previous balance was ABOVE). One alert
 * per crossing keeps it from spamming on every subsequent sale.
 */
export async function sendLowStockAlert(args: {
  productId: number;
  variantId: number;
  qty: number;
  threshold: number;
}): Promise<void> {
  if (!ENV.ownerEmail) return;
  const product = await db.getProductById(args.productId);
  const variant = await db.getVariantById(args.variantId);
  const productName = product?.name ?? "Unknown product";
  const variantName = variant?.name ?? "Unknown variant";

  const html = `
    <div style="font-family:sans-serif;max-width:520px">
      <h1 style="font-family:Georgia,serif;color:#CC2936;margin:0 0 8px 0">Low stock alert</h1>
      <p style="font-size:14px;color:#333">
        <strong>${productName}</strong> (${variantName}) just dropped to <strong>${args.qty}</strong>
        (threshold ${args.threshold}).
      </p>
      <p style="font-size:14px;color:#333">Time to restock before it sells out.</p>
      <p style="margin-top:16px"><a href="https://kemzobo.com/admin/inventory" style="display:inline-block;background:#CC2936;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:bold">Restock now</a></p>
    </div>
  `;

  await sendEmail({
    to: ENV.ownerEmail,
    subject: `Low stock — ${productName} (${variantName}) · ${args.qty} left`,
    content: `${productName} (${variantName}) is at ${args.qty}, below threshold of ${args.threshold}. Restock soon.`,
    html,
  }).catch((err) => console.error("[Low stock alert] failed:", err));
}
