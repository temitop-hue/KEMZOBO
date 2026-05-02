import Stripe from "stripe";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";
import { sendEmail } from "./_core/email";
import { formatPrice } from "@shared/const";
import { orderConfirmationEmail } from "./emailTemplates";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(ENV.stripeSecretKey);
  }
  return stripeInstance;
}

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function refundPaymentIntent(paymentIntentId: string): Promise<Stripe.Refund> {
  const stripe = getStripe();
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  const stripe = getStripe();
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (err: any) {
    // Already cancelled / succeeded / etc — log and move on
    console.warn(`[Stripe] Could not cancel PaymentIntent ${paymentIntentId}:`, err.message);
    return null;
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!ENV.stripeWebhookSecret) {
    console.warn("[Stripe] Webhook secret not configured");
    res.status(400).json({ error: "Webhook secret not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await db.getOrderByPaymentIntentId(paymentIntent.id);

      if (order) {
        await db.updateOrder(order.id, { paymentStatus: "paid", status: "processing" });

        // Reduce inventory for each order item — logs an inventory_movement
        // with reason=sale and reference=<order#> for the audit trail
        const items = await db.getOrderItemsByOrderId(order.id);
        for (const item of items) {
          await db.reduceInventory(item.variantId, item.quantity, order.orderNumber);
        }

        // Send styled confirmation email
        const emailData = orderConfirmationEmail({
          orderNumber: order.orderNumber,
          total: order.total,
          items,
          shippingAddress: order.shippingAddress,
        });
        await sendEmail({
          to: order.customerEmail,
          // BCC the owner on every order confirmation so they have a record
          bcc: ENV.ownerEmail || undefined,
          subject: emailData.subject,
          content: `Your order ${order.orderNumber} has been confirmed! Total: $${formatPrice(order.total)}.`,
          html: emailData.html,
        });
      }
      break;
    }
  }

  res.json({ received: true });
}
