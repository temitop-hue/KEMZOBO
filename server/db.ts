import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { and, between, desc, eq, gte, lte } from "drizzle-orm";
import {
  users,
  products,
  productVariants,
  inventory,
  inventoryMovements,
  expenses,
  invoices,
  invoiceItems,
  discountCodes,
  orders,
  orderItems,
  wholesaleRequests,
  contactMessages,
  emailSubscribers,
  type NewUser,
  type NewProduct,
  type NewProductVariant,
  type NewInventory,
  type NewInventoryMovement,
  type NewExpense,
  type NewInvoice,
  type NewInvoiceItem,
  type NewDiscountCode,
  type DiscountCode,
  type NewOrder,
  type NewOrderItem,
  type NewWholesaleRequest,
  type NewContactMessage,
  type NewEmailSubscriber,
} from "../drizzle/schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const client = connect({ url: process.env.DATABASE_URL });
    dbInstance = drizzle(client);
  }
  return dbInstance;
}

// ─── Users ───────────────────────────────────────────────
export async function getUserById(id: number) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user ?? null;
}

export async function createUser(data: Omit<NewUser, "id" | "createdAt" | "updatedAt" | "lastSignedIn">): Promise<number> {
  const db = getDb();
  const result = await db.insert(users).values(data);
  return Number((result as any).insertId);
}

export async function updateLastSignedIn(userId: number) {
  const db = getDb();
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function updatePasswordHash(userId: number, passwordHash: string) {
  const db = getDb();
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = getDb();
  return db.select().from(users);
}

// ─── Products ────────────────────────────────────────────
export async function getAllProducts(activeOnly = true) {
  const db = getDb();
  if (activeOnly) {
    return db.select().from(products).where(eq(products.isActive, 1));
  }
  return db.select().from(products);
}

export async function getProductBySlug(slug: string) {
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  return product ?? null;
}

export async function getProductById(id: number) {
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product ?? null;
}

export async function getFeaturedProducts() {
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, 1), eq(products.isActive, 1)));
}

export async function createProduct(data: Omit<NewProduct, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(products).values(data);
  return Number((result as any).insertId);
}

export async function updateProduct(id: number, data: Partial<NewProduct>) {
  const db = getDb();
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = getDb();
  await db.delete(products).where(eq(products.id, id));
}

// ─── Product Variants ────────────────────────────────────
export async function getVariantsByProductId(productId: number) {
  const db = getDb();
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

export async function getVariantById(id: number) {
  const db = getDb();
  const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
  return variant ?? null;
}

export async function createVariant(data: Omit<NewProductVariant, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(productVariants).values(data);
  return Number((result as any).insertId);
}

export async function updateVariant(id: number, data: Partial<NewProductVariant>) {
  const db = getDb();
  await db.update(productVariants).set(data).where(eq(productVariants.id, id));
}

// ─── Inventory ───────────────────────────────────────────
export async function getInventoryByVariantId(variantId: number) {
  const db = getDb();
  const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, variantId));
  return inv ?? null;
}

export async function upsertInventory(data: Omit<NewInventory, "id" | "updatedAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(inventory).values(data);
  return Number((result as any).insertId);
}

/**
 * Apply a stock change AND log a movement in one logical operation.
 * `delta` is a signed integer: negative = stock leaves, positive = stock arrives.
 * The movement row gives us a permanent audit trail.
 *
 * Side-effect: if this change causes the balance to cross from above-threshold
 * to at-or-below threshold, fires a low-stock alert email to the owner.
 */
export async function adjustInventory(args: {
  productId: number;
  variantId: number;
  delta: number;
  reason: NewInventoryMovement["reason"];
  reference?: string | null;
  note?: string | null;
  createdByUserId?: number | null;
}): Promise<{ balanceAfter: number }> {
  const db = getDb();
  const inv = await getInventoryByVariantId(args.variantId);
  const currentQty = inv?.quantityAvailable ?? 0;
  // Reductions can't push stock below zero — clamp instead
  const newQty = Math.max(0, currentQty + args.delta);
  const actualDelta = newQty - currentQty;
  const threshold = inv?.lowStockThreshold ?? 10;

  if (inv) {
    await db
      .update(inventory)
      .set({ quantityAvailable: newQty })
      .where(eq(inventory.variantId, args.variantId));
  } else {
    await db.insert(inventory).values({
      productId: args.productId,
      variantId: args.variantId,
      quantityAvailable: newQty,
    });
  }

  await db.insert(inventoryMovements).values({
    productId: args.productId,
    variantId: args.variantId,
    quantityDelta: actualDelta,
    balanceAfter: newQty,
    reason: args.reason,
    reference: args.reference ?? null,
    note: args.note ?? null,
    createdByUserId: args.createdByUserId ?? null,
  });

  // Fire-and-forget low-stock alert on threshold crossing only (not every sale below)
  if (currentQty > threshold && newQty <= threshold) {
    // Lazy import to avoid circular module load
    const { sendLowStockAlert } = await import("./notifications");
    sendLowStockAlert({
      productId: args.productId,
      variantId: args.variantId,
      qty: newQty,
      threshold,
    }).catch((err) => console.error("[Low stock alert] dispatch failed:", err));
  }

  return { balanceAfter: newQty };
}

/**
 * Legacy helper kept for the Stripe webhook path. Always reduces and logs as a sale.
 * New code should call adjustInventory directly with an explicit reason.
 */
export async function reduceInventory(variantId: number, quantity: number, reference?: string) {
  const inv = await getInventoryByVariantId(variantId);
  if (!inv) return;
  await adjustInventory({
    productId: inv.productId,
    variantId,
    delta: -Math.abs(quantity),
    reason: "sale",
    reference: reference ?? null,
  });
}

export async function getInventoryMovements(opts: { variantId?: number; limit?: number } = {}) {
  const db = getDb();
  let q = db.select().from(inventoryMovements).$dynamic();
  if (opts.variantId !== undefined) {
    q = q.where(eq(inventoryMovements.variantId, opts.variantId));
  }
  const rows = await q.orderBy(desc(inventoryMovements.id)).limit(opts.limit ?? 100);
  return rows;
}

export async function getAllInventory() {
  const db = getDb();
  return db.select().from(inventory);
}

export async function getLowStockItems() {
  const db = getDb();
  const allInventory = await db.select().from(inventory);
  return allInventory.filter(
    (i) => (i.quantityAvailable ?? 0) <= (i.lowStockThreshold ?? 10)
  );
}

// ─── Orders ──────────────────────────────────────────────
export async function createOrder(data: Omit<NewOrder, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = getDb();
  await db.insert(orders).values(data);
  // TiDB serverless doesn't return insertId reliably — query by orderNumber
  if (data.orderNumber) {
    const order = await getOrderByNumber(data.orderNumber);
    if (order) return order.id;
  }
  return 0;
}

export async function getOrderById(id: number) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order ?? null;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  return order ?? null;
}

export async function getOrderByPaymentIntentId(paymentIntentId: string) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
  return order ?? null;
}

export async function getOrdersByUserId(userId: number) {
  const db = getDb();
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getAllOrders() {
  const db = getDb();
  return db.select().from(orders);
}

// ─── Finance ──────────────────────────────────────────────
/**
 * Sum revenue for a date range. Counts only orders that were paid AND not
 * subsequently refunded — paymentStatus already flips to 'refunded' when
 * we issue a refund, so a single equality check is sufficient.
 */
export async function getRevenueBetween(from: Date, to: Date): Promise<number> {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, "paid"),
        between(orders.createdAt, from, to)
      )
    );
  return rows.reduce((sum, o) => sum + (o.total ?? 0), 0);
}

export async function listExpenses(from: Date, to: Date) {
  const db = getDb();
  return db
    .select()
    .from(expenses)
    .where(between(expenses.occurredAt, from, to))
    .orderBy(desc(expenses.occurredAt));
}

export async function createExpense(data: Omit<NewExpense, "id" | "createdAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(expenses).values(data);
  return Number((result as any).insertId);
}

export async function deleteExpense(id: number) {
  const db = getDb();
  await db.delete(expenses).where(eq(expenses.id, id));
}

// ─── Invoices ─────────────────────────────────────────────
export async function getAllInvoices() {
  const db = getDb();
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number) {
  const db = getDb();
  const [inv] = await db.select().from(invoices).where(eq(invoices.id, id));
  return inv ?? null;
}

export async function getInvoiceItems(invoiceId: number) {
  const db = getDb();
  return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function nextInvoiceNumber(): Promise<string> {
  const db = getDb();
  const all = await db.select().from(invoices);
  const seq = 1000 + all.length + 1;
  return `INV-${seq}`;
}

export async function createInvoice(data: Omit<NewInvoice, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(invoices).values(data);
  return Number((result as any).insertId);
}

export async function createInvoiceItem(data: Omit<NewInvoiceItem, "id">): Promise<void> {
  const db = getDb();
  await db.insert(invoiceItems).values(data);
}

export async function updateInvoice(id: number, data: Partial<NewInvoice>) {
  const db = getDb();
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = getDb();
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  await db.delete(invoices).where(eq(invoices.id, id));
}

// ─── Discount codes ──────────────────────────────────────
export async function getAllDiscountCodes() {
  const db = getDb();
  return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
}

export async function getDiscountByCode(code: string): Promise<DiscountCode | null> {
  const db = getDb();
  const [d] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.code, code.toUpperCase()));
  return d ?? null;
}

export async function createDiscountCode(data: Omit<NewDiscountCode, "id" | "createdAt" | "updatedAt" | "usageCount">): Promise<number> {
  const db = getDb();
  const result = await db.insert(discountCodes).values({ ...data, code: data.code.toUpperCase() });
  return Number((result as any).insertId);
}

export async function updateDiscountCode(id: number, data: Partial<NewDiscountCode>) {
  const db = getDb();
  const patch = data.code ? { ...data, code: data.code.toUpperCase() } : data;
  await db.update(discountCodes).set(patch).where(eq(discountCodes.id, id));
}

export async function deleteDiscountCode(id: number) {
  const db = getDb();
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
}

export async function incrementDiscountUsage(id: number) {
  const db = getDb();
  const [current] = await db.select().from(discountCodes).where(eq(discountCodes.id, id));
  if (!current) return;
  await db
    .update(discountCodes)
    .set({ usageCount: (current.usageCount ?? 0) + 1 })
    .where(eq(discountCodes.id, id));
}

/**
 * Validate a discount code against a subtotal. Returns either a successful
 * result with the applied discount in cents, or a reason it was rejected.
 * Pure function over a fetched DiscountCode + subtotal — no side effects.
 */
export function evaluateDiscount(
  code: DiscountCode,
  subtotalCents: number
): { ok: true; discountCents: number } | { ok: false; reason: string } {
  if (!code.isActive) return { ok: false, reason: "This code is no longer active" };

  const now = new Date();
  if (code.validFrom && new Date(code.validFrom) > now) {
    return { ok: false, reason: "This code is not active yet" };
  }
  if (code.validUntil && new Date(code.validUntil) < now) {
    return { ok: false, reason: "This code has expired" };
  }
  if (code.usageLimit != null && (code.usageCount ?? 0) >= code.usageLimit) {
    return { ok: false, reason: "This code has been fully redeemed" };
  }
  if (code.minOrderTotal && subtotalCents < code.minOrderTotal) {
    const needed = ((code.minOrderTotal - subtotalCents) / 100).toFixed(2);
    return { ok: false, reason: `Add $${needed} more to use this code` };
  }

  const discount = code.type === "percent"
    ? Math.round(subtotalCents * (code.value / 100))
    : Math.min(code.value, subtotalCents); // fixed_amount can't exceed subtotal

  return { ok: true, discountCents: discount };
}

/**
 * Mark sent invoices as overdue if their due date has passed. Idempotent.
 * Called by the hourly cron alongside abandoned-order cleanup.
 */
export async function markOverdueInvoices(): Promise<{ marked: number }> {
  const db = getDb();
  const all = await db.select().from(invoices).where(eq(invoices.status, "sent"));
  const now = new Date();
  let marked = 0;
  for (const inv of all) {
    if (inv.dueAt && new Date(inv.dueAt) < now) {
      await db.update(invoices).set({ status: "overdue" }).where(eq(invoices.id, inv.id));
      marked++;
    }
  }
  return { marked };
}

export async function updateOrder(id: number, data: Partial<NewOrder>) {
  const db = getDb();
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── Order Items ─────────────────────────────────────────
export async function createOrderItem(data: Omit<NewOrderItem, "id" | "createdAt">): Promise<void> {
  const db = getDb();
  await db.insert(orderItems).values(data);
}

export async function getOrderItemsByOrderId(orderId: number) {
  const db = getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ─── Wholesale Requests ──────────────────────────────────
export async function createWholesaleRequest(data: Omit<NewWholesaleRequest, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(wholesaleRequests).values(data);
  return Number((result as any).insertId);
}

export async function getAllWholesaleRequests() {
  const db = getDb();
  return db.select().from(wholesaleRequests);
}

export async function updateWholesaleRequest(id: number, data: Partial<NewWholesaleRequest>) {
  const db = getDb();
  await db.update(wholesaleRequests).set(data).where(eq(wholesaleRequests.id, id));
}

// ─── Contact Messages ────────────────────────────────────
export async function createContactMessage(data: Omit<NewContactMessage, "id" | "createdAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(contactMessages).values(data);
  return Number((result as any).insertId);
}

export async function getAllContactMessages() {
  const db = getDb();
  return db.select().from(contactMessages);
}

export async function updateContactMessage(id: number, data: Partial<NewContactMessage>) {
  const db = getDb();
  await db.update(contactMessages).set(data).where(eq(contactMessages.id, id));
}

// ─── Email Subscribers ───────────────────────────────────
export async function subscribeEmail(email: string): Promise<number> {
  const db = getDb();
  const [existing] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
  if (existing) return existing.id;
  const result = await db.insert(emailSubscribers).values({ email });
  return Number((result as any).insertId);
}

export async function getAllSubscribers() {
  const db = getDb();
  return db.select().from(emailSubscribers);
}
