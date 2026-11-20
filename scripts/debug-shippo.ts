/**
 * Read-only: show every rate + carrier message Shippo returns for one sample box,
 * and which carrier accounts are active. No database access.
 *
 * Usage:
 *   npx tsx scripts/debug-shippo.ts
 */
import "dotenv/config";

const headers = {
  Authorization: `ShippoToken ${process.env.SHIPPO_API_TOKEN}`,
  "Content-Type": "application/json",
};

const accounts = await (await fetch("https://api.goshippo.com/carrier_accounts/?results=50", { headers })).json();
console.log("Carrier accounts:");
console.table(
  (accounts.results ?? []).map((a: any) => ({ carrier: a.carrier, active: a.active, test: a.test, shippo_account: a.is_shippo_account }))
);

const shipment = await (
  await fetch("https://api.goshippo.com/shipments/", {
    method: "POST",
    headers,
    body: JSON.stringify({
      address_from: { name: "KEMZOBO", street1: "13520 McLearen Road", city: "Herndon", state: "VA", zip: "20171", country: "US" },
      address_to: { name: "Test Buyer", street1: "55 Trinity Ave SW", city: "Atlanta", state: "GA", zip: "30303", country: "US" },
      parcels: [{ length: "12", width: "10", height: "8", distance_unit: "in", weight: "14", mass_unit: "lb" }],
      async: false,
    }),
  })
).json();

console.log("All rates:");
console.table((shipment.rates ?? []).map((r: any) => ({ provider: r.provider, token: r.servicelevel?.token, amount: r.amount, days: r.estimated_days })));
console.log("Messages:");
console.log(JSON.stringify(shipment.messages ?? [], null, 2));
