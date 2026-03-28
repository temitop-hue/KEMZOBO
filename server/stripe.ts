import Stripe from "stripe";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";
import { sendEmail } from "./_core/email";
import { formatPrice } from "@shared/const";

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

        // Reduce inventory for each order item
        const items = await db.getOrderItemsByOrderId(order.id);
        for (const item of items) {
          await db.reduceInventory(item.variantId, item.quantity);
        }

        // Send confirmation email
        await sendEmail({
          to: order.customerEmail,
          subject: `Order Confirmed - ${order.orderNumber}`,
          content: `Your order ${order.orderNumber} has been confirmed! Total: $${formatPrice(order.total)}.`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #7C2D12;">Order Confirmed!</h2>
              <p>Thank you for your order. Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
              <p><strong>Total:</strong> $${formatPrice(order.total)}</p>
              <p>We'll notify you when your order ships.</p>
              <p style="margin-top: 24px; color: #666; font-size: 14px;">— KEMZOBO</p>
            </div>
          `,
        });
      }
      break;
    }
  }

  res.json({ received: true });
}
