export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// Order statuses
export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

// Product categories
export const PRODUCT_CATEGORIES = ["classic", "tropical", "spiced", "seasonal"] as const;

// Wholesale statuses
export const WHOLESALE_STATUSES = ["new", "contacted", "negotiating", "approved", "declined"] as const;

// Bulk pricing tiers (prices in cents)
export function getBulkPrice(basePrice: number, qty: number): number {
  if (qty >= 500) return Math.round(basePrice * 0.86);
  if (qty >= 100) return Math.round(basePrice * 0.91);
  if (qty >= 24) return Math.round(basePrice * 0.95);
  return basePrice;
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}
