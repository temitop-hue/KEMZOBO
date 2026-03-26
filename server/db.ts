import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { eq } from "drizzle-orm";
import {
  users,
  products,
  productVariants,
  inventory,
  orders,
  orderItems,
  wholesaleRequests,
  contactMessages,
  type NewUser,
  type NewProduct,
  type NewProductVariant,
  type NewInventory,
  type NewOrder,
  type NewOrderItem,
  type NewWholesaleRequest,
  type NewContactMessage,
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
  return db.select().from(products).where(eq(products.isFeatured, 1));
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

export async function reduceInventory(variantId: number, quantity: number) {
  const db = getDb();
  const inv = await getInventoryByVariantId(variantId);
  if (!inv) return;
  const newQty = Math.max(0, (inv.quantityAvailable ?? 0) - quantity);
  await db.update(inventory).set({ quantityAvailable: newQty }).where(eq(inventory.variantId, variantId));
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
  const result = await db.insert(orders).values(data);
  return Number((result as any).insertId);
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

export async function updateOrder(id: number, data: Partial<NewOrder>) {
  const db = getDb();
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── Order Items ─────────────────────────────────────────
export async function createOrderItem(data: Omit<NewOrderItem, "id" | "createdAt">): Promise<number> {
  const db = getDb();
  const result = await db.insert(orderItems).values(data);
  return Number((result as any).insertId);
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
