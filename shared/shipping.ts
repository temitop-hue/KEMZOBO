// Shipping config shared by server and client.
// Every sellable variant is a 12-can case, and each case ships in its own box.

export const CASE_PARCEL = {
  length: "12",
  width: "10",
  height: "8",
  distance_unit: "in",
  weight: "14", // packed weight; the unboxed case is 13.25 lb
  mass_unit: "lb",
} as const;

// Packaging added per box on top of the live carrier rate (outer box, packing, tape, label).
// Shown to customers as part of one "Shipping and packaging" line, not as a separate fee.
export const HANDLING_FEE_CENTS_PER_BOX = 250;

// Online checkout covers 1–4 cases. 5+ cases go to the wholesale team instead.
export const MAX_ONLINE_CASES = 4;
export const WHOLESALE_CASE_MESSAGE =
  "Ordering 5 or more cases? Contact us for wholesale pricing and delivery or freight options.";

export const TAX_RATE = 0.06; // 6% tax estimate on the discounted subtotal

export type ShippingOption = {
  quoteToken: string;
  carrier: string;
  service: string;
  estimatedDays: number | null;
  durationTerms: string | null;
  amount: number; // cents, (carrier rate + packaging) × boxes
  carrierAmount: number; // cents, carrier rate × boxes
  boxes: number;
};
