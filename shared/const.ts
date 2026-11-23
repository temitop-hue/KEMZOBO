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

// Online orders are 1-4 cases at the retail price; volume pricing is wholesale-only
// (see WHOLESALE_TIERS), so online carts get no automatic bulk discount.
export function getBulkPrice(basePrice: number, _qty: number): number {
  return basePrice;
}

// Wholesale & volume pricing per 12-can case (cents), price sheet effective November 2026.
// Shipping/delivery is quoted separately. Highest minimum first.
export const WHOLESALE_TIERS = [
  { minCases: 100, maxCases: null, orderType: "Distributor / Wholesaler", pricePerCase: 3000 },
  { minCases: 50, maxCases: 99, orderType: "Distributor / Wholesaler", pricePerCase: 3200 },
  { minCases: 20, maxCases: 49, orderType: "Retailer / Restaurant", pricePerCase: 3500 },
  { minCases: 10, maxCases: 19, orderType: "Retailer / Restaurant", pricePerCase: 3600 },
  { minCases: 5, maxCases: 9, orderType: "Business Starter Order", pricePerCase: 4000 },
] as const;

/** Per-case wholesale price for an order of `cases`, or null below the 5-case minimum. */
export function getWholesaleCasePrice(cases: number): number | null {
  return WHOLESALE_TIERS.find((t) => cases >= t.minCases)?.pricePerCase ?? null;
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}
