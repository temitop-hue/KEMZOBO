import * as db from "./db";
import { cancelPaymentIntent } from "./stripe";
import { sendDailyDigest, sendAbandonedCartReminders } from "./notifications";

const ABANDONED_THRESHOLD_HOURS = 48;
const CRON_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export async function cleanupAbandonedOrders(): Promise<{ cancelled: number }> {
  const cutoff = new Date(Date.now() - ABANDONED_THRESHOLD_HOURS * 60 * 60 * 1000);

  const all = await db.getAllOrders();
  const stale = all.filter(
    (o) =>
      o.status === "pending" &&
      o.paymentStatus === "unpaid" &&
      o.createdAt != null &&
      new Date(o.createdAt) < cutoff
  );

  let cancelled = 0;
  for (const order of stale) {
    try {
      if (order.stripePaymentIntentId) {
        await cancelPaymentIntent(order.stripePaymentIntentId);
      }
      await db.updateOrder(order.id, { status: "cancelled" });
      console.log(`[Cron] Cancelled abandoned order ${order.orderNumber}`);
      cancelled++;
    } catch (err) {
      console.error(`[Cron] Failed to cancel order ${order.orderNumber}:`, err);
    }
  }
  return { cancelled };
}

export function startCron() {
  const runOnce = async () => {
    try {
      const result = await cleanupAbandonedOrders();
      if (result.cancelled > 0) {
        console.log(`[Cron] Abandoned-order sweep: ${result.cancelled} cancelled`);
      }
    } catch (err) {
      console.error("[Cron] Abandoned-order sweep failed:", err);
    }

    try {
      const result = await db.markOverdueInvoices();
      if (result.marked > 0) {
        console.log(`[Cron] Invoice overdue sweep: ${result.marked} marked overdue`);
      }
    } catch (err) {
      console.error("[Cron] Invoice overdue sweep failed:", err);
    }

    // Daily owner digest — fires once at the digest hour (8 UTC), no-op otherwise
    try {
      const result = await sendDailyDigest();
      if (result.sent) {
        console.log(`[Cron] Daily digest sent`);
      }
    } catch (err) {
      console.error("[Cron] Daily digest failed:", err);
    }

    // Abandoned-cart recovery — sweep orders 24-48h old without a reminder yet
    try {
      const result = await sendAbandonedCartReminders();
      if (result.sent > 0) {
        console.log(`[Cron] Abandoned-cart reminders: ${result.sent} sent`);
      }
    } catch (err) {
      console.error("[Cron] Abandoned-cart reminder sweep failed:", err);
    }
  };

  setTimeout(runOnce, 30_000);
  setInterval(runOnce, CRON_INTERVAL_MS);

  console.log(`[Cron] Hourly sweeps scheduled (abandoned orders ${ABANDONED_THRESHOLD_HOURS}h, overdue invoices)`);
}
