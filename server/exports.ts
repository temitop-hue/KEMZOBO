/**
 * CSV exports for the admin panel. These are plain Express routes (not tRPC)
 * because the browser needs to trigger a file download with the right
 * Content-Disposition headers — tRPC's JSON envelope makes that awkward.
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import * as db from "./db";

/** RFC 4180 escape: wrap in quotes if the cell contains comma/quote/newline. */
function csvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  let s = typeof val === "string" ? val : String(val);
  if (/[",\n\r]/.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(r[c])).join(",")).join("\n");
  // Lead with UTF-8 BOM so Excel reads accents/emoji correctly
  return "﻿" + header + "\n" + body + "\n";
}

function sendCsv(res: Response, filename: string, body: string) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.send(body);
}

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user || user.role !== "admin") {
      res.status(401).send("Unauthorized");
      return false;
    }
    return true;
  } catch {
    res.status(401).send("Unauthorized");
    return false;
  }
}

function parseRange(req: Request): { from: Date; to: Date } {
  const fromStr = (req.query.from as string) || null;
  const toStr = (req.query.to as string) || null;
  const to = toStr ? new Date(toStr) : new Date();
  // Default: last 90 days
  const from = fromStr ? new Date(fromStr) : new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
  return { from, to };
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ─── Orders ────────────────────────────────────────────────
export async function exportOrders(req: Request, res: Response) {
  if (!(await requireAdmin(req, res))) return;
  const { from, to } = parseRange(req);

  const all = await db.getAllOrders();
  const inRange = all.filter((o) => {
    if (!o.createdAt) return false;
    const t = new Date(o.createdAt);
    return t >= from && t <= to;
  });

  // One row per order (high-level summary). Items stay in their own export
  // if we ever need them — keeping this readable in Excel matters more.
  const rows = inRange.map((o) => ({
    order_number: o.orderNumber,
    created_at: o.createdAt ? new Date(o.createdAt).toISOString() : "",
    customer_email: o.customerEmail,
    customer_name: o.shippingAddress?.name ?? "",
    customer_phone: o.shippingAddress?.phone ?? "",
    ship_street: o.shippingAddress?.street ?? "",
    ship_city: o.shippingAddress?.city ?? "",
    ship_state: o.shippingAddress?.state ?? "",
    ship_zip: o.shippingAddress?.zip ?? "",
    status: o.status ?? "",
    payment_status: o.paymentStatus ?? "",
    subtotal_usd: dollars(o.subtotal ?? 0),
    delivery_usd: dollars(o.deliveryFee ?? 0),
    tax_usd: dollars(o.tax ?? 0),
    total_usd: dollars(o.total ?? 0),
    tracking_number: o.trackingNumber ?? "",
    tracking_carrier: o.trackingCarrier ?? "",
    stripe_payment_intent: o.stripePaymentIntentId ?? "",
  }));

  const columns = [
    "order_number", "created_at", "customer_email", "customer_name", "customer_phone",
    "ship_street", "ship_city", "ship_state", "ship_zip",
    "status", "payment_status",
    "subtotal_usd", "delivery_usd", "tax_usd", "total_usd",
    "tracking_number", "tracking_carrier", "stripe_payment_intent",
  ];
  const fname = `kemzobo-orders-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv`;
  sendCsv(res, fname, toCsv(rows, columns));
}

// ─── Revenue summary (daily) ──────────────────────────────
export async function exportRevenue(req: Request, res: Response) {
  if (!(await requireAdmin(req, res))) return;
  const { from, to } = parseRange(req);

  const all = await db.getAllOrders();
  const expenses = await db.listExpenses(from, to);

  // Bucket revenue and expenses by ISO day (YYYY-MM-DD)
  const byDay: Record<string, { revenueCents: number; orders: number; expensesCents: number }> = {};

  for (const o of all) {
    if (o.paymentStatus !== "paid") continue;
    if (!o.createdAt) continue;
    const t = new Date(o.createdAt);
    if (t < from || t > to) continue;
    const day = t.toISOString().slice(0, 10);
    byDay[day] ??= { revenueCents: 0, orders: 0, expensesCents: 0 };
    byDay[day].revenueCents += o.total ?? 0;
    byDay[day].orders += 1;
  }

  for (const e of expenses) {
    const day = new Date(e.occurredAt).toISOString().slice(0, 10);
    byDay[day] ??= { revenueCents: 0, orders: 0, expensesCents: 0 };
    byDay[day].expensesCents += e.amount;
  }

  const rows = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({
      date: day,
      orders: v.orders,
      revenue_usd: dollars(v.revenueCents),
      expenses_usd: dollars(v.expensesCents),
      profit_usd: dollars(v.revenueCents - v.expensesCents),
    }));

  // Append a totals row for quick scanning in Excel
  const totals = rows.reduce(
    (acc, r) => {
      acc.orders += r.orders;
      acc.revenueCents += Math.round(parseFloat(r.revenue_usd) * 100);
      acc.expensesCents += Math.round(parseFloat(r.expenses_usd) * 100);
      return acc;
    },
    { orders: 0, revenueCents: 0, expensesCents: 0 }
  );
  rows.push({
    date: "TOTAL",
    orders: totals.orders,
    revenue_usd: dollars(totals.revenueCents),
    expenses_usd: dollars(totals.expensesCents),
    profit_usd: dollars(totals.revenueCents - totals.expensesCents),
  });

  const columns = ["date", "orders", "revenue_usd", "expenses_usd", "profit_usd"];
  const fname = `kemzobo-revenue-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv`;
  sendCsv(res, fname, toCsv(rows, columns));
}

// ─── Inventory snapshot ───────────────────────────────────
export async function exportInventory(req: Request, res: Response) {
  if (!(await requireAdmin(req, res))) return;

  const inv = await db.getAllInventory();
  const rows = await Promise.all(
    inv.map(async (i) => {
      const product = await db.getProductById(i.productId);
      const variant = await db.getVariantById(i.variantId);
      return {
        product: product?.name ?? "",
        product_slug: product?.slug ?? "",
        variant: variant?.name ?? "",
        weight: variant?.weight ?? "",
        sku: variant?.sku ?? "",
        unit_price_usd: dollars(variant?.price ?? 0),
        in_stock: i.quantityAvailable ?? 0,
        low_stock_threshold: i.lowStockThreshold ?? 10,
        is_low_stock:
          (i.quantityAvailable ?? 0) <= (i.lowStockThreshold ?? 10) ? "yes" : "no",
        updated_at: i.updatedAt ? new Date(i.updatedAt).toISOString() : "",
      };
    })
  );

  const columns = [
    "product", "product_slug", "variant", "weight", "sku",
    "unit_price_usd", "in_stock", "low_stock_threshold", "is_low_stock", "updated_at",
  ];
  const fname = `kemzobo-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  sendCsv(res, fname, toCsv(rows, columns));
}
