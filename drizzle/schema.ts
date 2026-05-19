import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  email: varchar({ length: 320 }).unique().notNull(),
  name: text(),
  phone: varchar({ length: 50 }),
  passwordHash: text(),
  role: mysqlEnum(["user", "admin"]).default("user"),
  shippingAddress: json().$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
  lastSignedIn: timestamp().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Products ────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).unique().notNull(),
  description: text(),
  imageUrl: text(),
  images: json().$type<string[]>(),
  category: mysqlEnum(["classic", "tropical", "spiced", "seasonal"]).default("classic"),
  isActive: int().default(1),
  isFeatured: int().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// ─── Product Variants ────────────────────────────────────
export const productVariants = mysqlTable("product_variants", {
  id: int().autoincrement().primaryKey(),
  productId: int().notNull(),
  name: varchar({ length: 255 }).notNull(), // e.g. "Single Can", "6-Pack", "Case of 24"
  price: int().notNull(), // cents
  compareAtPrice: int(), // cents, for showing sale/original price
  sku: varchar({ length: 100 }),
  weight: varchar({ length: 50 }), // e.g. "12 oz", "6 x 12 oz"
  isActive: int().default(1),
  sortOrder: int().default(0),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

// ─── Inventory ───────────────────────────────────────────
export const inventory = mysqlTable("inventory", {
  id: int().autoincrement().primaryKey(),
  productId: int().notNull(),
  variantId: int().notNull(),
  quantityAvailable: int().default(0),
  lowStockThreshold: int().default(10),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;

// ─── Inventory Movements (audit log of every stock change) ───
export const inventoryMovements = mysqlTable("inventory_movements", {
  id: int().autoincrement().primaryKey(),
  productId: int().notNull(),
  variantId: int().notNull(),
  quantityDelta: int().notNull(), // negative for sale/loss, positive for restock/refund-restock
  balanceAfter: int().notNull(), // resulting quantityAvailable for fast running totals
  reason: mysqlEnum([
    "sale",
    "refund_restock",
    "restock",
    "manual_adjustment",
    "loss",
    "correction",
  ]).notNull(),
  reference: varchar({ length: 100 }), // e.g. order number "KZ-10042"
  note: text(),
  createdByUserId: int(), // null for system-driven (sales)
  createdAt: timestamp().defaultNow(),
});

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;

// ─── Expenses (manual ledger entries) ───────────────────
export const expenses = mysqlTable("expenses", {
  id: int().autoincrement().primaryKey(),
  amount: int().notNull(), // cents (always positive — subtraction is implicit)
  category: mysqlEnum([
    "ingredients",
    "packaging",
    "shipping",
    "marketing",
    "equipment",
    "fees",
    "other",
  ]).notNull(),
  description: varchar({ length: 500 }).notNull(),
  occurredAt: timestamp().notNull(), // when the spend actually happened
  createdByUserId: int(),
  createdAt: timestamp().defaultNow(),
});

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

// ─── B2B Invoices ────────────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: int().autoincrement().primaryKey(),
  invoiceNumber: varchar({ length: 50 }).unique().notNull(),
  publicToken: varchar({ length: 64 }).unique(), // shareable URL token
  status: mysqlEnum(["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  clientName: varchar({ length: 255 }).notNull(),
  clientEmail: varchar({ length: 320 }),
  clientPhone: varchar({ length: 50 }),
  clientAddress: text(),
  subtotal: int().notNull(), // cents
  tax: int().default(0),
  total: int().notNull(), // cents
  notes: text(),
  issuedAt: timestamp().defaultNow(),
  dueAt: timestamp().notNull(),
  sentAt: timestamp(),
  paidAt: timestamp(),
  wholesaleRequestId: int(),
  createdByUserId: int(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const invoiceItems = mysqlTable("invoice_items", {
  id: int().autoincrement().primaryKey(),
  invoiceId: int().notNull(),
  description: varchar({ length: 500 }).notNull(),
  quantity: int().notNull(),
  unitPrice: int().notNull(), // cents
  lineTotal: int().notNull(), // cents
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

// ─── Discount codes ──────────────────────────────────────
export const discountCodes = mysqlTable("discount_codes", {
  id: int().autoincrement().primaryKey(),
  code: varchar({ length: 50 }).unique().notNull(), // uppercase
  description: varchar({ length: 200 }),
  type: mysqlEnum(["percent", "fixed_amount"]).notNull(),
  value: int().notNull(), // percent (0-100) or cents
  minOrderTotal: int().default(0), // cents — discount only applies above this subtotal
  usageLimit: int(), // null = unlimited
  usageCount: int().default(0),
  validFrom: timestamp().defaultNow(),
  validUntil: timestamp(), // null = no expiry
  isActive: int().default(1), // 0/1
  createdByUserId: int(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

// ─── Customer reviews ────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int().autoincrement().primaryKey(),
  productId: int().notNull(),
  orderId: int(), // null = unverified review (e.g. seeded), present = verified purchase
  customerEmail: varchar({ length: 320 }).notNull(),
  customerName: varchar({ length: 120 }).notNull(),
  rating: int().notNull(), // 1-5
  title: varchar({ length: 200 }),
  body: text().notNull(),
  status: mysqlEnum(["pending", "approved", "rejected"]).default("approved"),
  createdAt: timestamp().defaultNow(),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// ─── Back-in-stock subscriptions ─────────────────────────
export const backInStockSubs = mysqlTable("back_in_stock_subs", {
  id: int().autoincrement().primaryKey(),
  variantId: int().notNull(),
  email: varchar({ length: 320 }).notNull(),
  createdAt: timestamp().defaultNow(),
  notifiedAt: timestamp(), // null until the email fires
});

export type BackInStockSub = typeof backInStockSubs.$inferSelect;
export type NewBackInStockSub = typeof backInStockSubs.$inferInsert;

// ─── Orders ──────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int().autoincrement().primaryKey(),
  userId: int(), // nullable for guest checkout
  orderNumber: varchar({ length: 50 }).unique().notNull(),
  status: mysqlEnum(["pending", "processing", "packed", "shipped", "delivered", "cancelled"]).default("pending"),
  packedAt: timestamp(),
  shippedAt: timestamp(),
  deliveredAt: timestamp(),
  paymentStatus: mysqlEnum(["unpaid", "paid", "refunded"]).default("unpaid"),
  subtotal: int().notNull(), // cents
  deliveryFee: int().default(0),
  tax: int().default(0),
  total: int().notNull(), // cents
  shippingAddress: json().$type<{
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  }>(),
  billingAddress: json().$type<{
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  stripePaymentIntentId: varchar({ length: 255 }),
  stripeSessionId: varchar({ length: 255 }),
  trackingNumber: varchar({ length: 255 }),
  trackingCarrier: varchar({ length: 100 }),
  deliveryMethod: mysqlEnum(["self", "third_party"]).default("third_party"),
  customerEmail: varchar({ length: 320 }).notNull(),
  discountCode: varchar({ length: 50 }), // code applied at checkout, if any
  discountAmount: int().default(0), // cents — already subtracted from total
  abandonedReminderSentAt: timestamp(), // null until the recovery email fires
  notes: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// ─── Order Items ─────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int().autoincrement().primaryKey(),
  orderId: int().notNull(),
  productId: int().notNull(),
  variantId: int().notNull(),
  productName: varchar({ length: 255 }).notNull(),
  variantName: varchar({ length: 255 }).notNull(),
  quantity: int().notNull(),
  unitPrice: int().notNull(), // cents, snapshot at order time
  createdAt: timestamp().defaultNow(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// ─── Wholesale Requests ──────────────────────────────────
export const wholesaleRequests = mysqlTable("wholesale_requests", {
  id: int().autoincrement().primaryKey(),
  businessName: varchar({ length: 255 }).notNull(),
  contactName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 320 }).notNull(),
  phone: varchar({ length: 50 }),
  businessType: mysqlEnum(["store", "restaurant", "event", "distributor", "other"]).default("other"),
  estimatedVolume: varchar({ length: 255 }),
  message: text(),
  status: mysqlEnum(["new", "contacted", "negotiating", "approved", "declined"]).default("new"),
  adminNotes: text(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export type WholesaleRequest = typeof wholesaleRequests.$inferSelect;
export type NewWholesaleRequest = typeof wholesaleRequests.$inferInsert;

// ─── Contact Messages ────────────────────────────────────
export const contactMessages = mysqlTable("contact_messages", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 320 }).notNull(),
  phone: varchar({ length: 50 }),
  subject: varchar({ length: 255 }),
  message: text().notNull(),
  status: mysqlEnum(["new", "read", "replied"]).default("new"),
  createdAt: timestamp().defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

// ─── Email Subscribers ───────────────────────────────────
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int().autoincrement().primaryKey(),
  email: varchar({ length: 320 }).unique().notNull(),
  createdAt: timestamp().defaultNow(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type NewEmailSubscriber = typeof emailSubscribers.$inferInsert;
