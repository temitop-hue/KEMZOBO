/**
 * Read-only: fetch live Shippo ground rates for a sample address. No database access.
 *
 * Usage:
 *   npx tsx scripts/test-shipping-rates.ts [boxes] [zip]
 */
import "dotenv/config";
import { getShippingOptions } from "../server/shipping";

const boxes = Number(process.argv[2] ?? 1);
const zip = process.argv[3] ?? "30303";

const samples: Record<string, { street: string; city: string; state: string }> = {
  "30303": { street: "55 Trinity Ave SW", city: "Atlanta", state: "GA" },
  "90012": { street: "200 N Spring St", city: "Los Angeles", state: "CA" },
  "20171": { street: "13560 Dulles Technology Dr", city: "Herndon", state: "VA" },
};
const addr = samples[zip] ?? samples["30303"];

const options = await getShippingOptions({ name: "Test Buyer", ...addr, zip }, boxes);
console.log(`${options.length} ground options for ${boxes} box(es) to ${addr.city}, ${addr.state} ${zip}:`);
console.table(
  options.map((o) => ({
    carrier: o.carrier,
    service: o.service,
    days: o.estimatedDays,
    carrier$: (o.carrierAmount / 100).toFixed(2),
    buyerPays$: (o.amount / 100).toFixed(2),
  }))
);
