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

// Added once per order on top of the live carrier rate, shown inside the shipping line
export const HANDLING_FEE_CENTS = 250;

export const TAX_RATE = 0.06; // 6% tax estimate on the discounted subtotal

export type ShippingOption = {
  quoteToken: string;
  carrier: string;
  service: string;
  estimatedDays: number | null;
  durationTerms: string | null;
  amount: number; // cents, carrier rate × boxes + handling
  carrierAmount: number; // cents, carrier rate × boxes
  boxes: number;
};
