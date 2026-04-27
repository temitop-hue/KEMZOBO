import * as db from "./db";
import { cancelPaymentIntent } from "./stripe";

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
  };

  setTimeout(runOnce, 30_000);
  setInterval(runOnce, CRON_INTERVAL_MS);

  console.log(`[Cron] Abandoned-order cleanup scheduled (every ${CRON_INTERVAL_MS / 60000}min, threshold ${ABANDONED_THRESHOLD_HOURS}h)`);
}
