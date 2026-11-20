import { SignJWT, jwtVerify } from "jose";
import { CASE_PARCEL, HANDLING_FEE_CENTS, type ShippingOption } from "@shared/shipping";
import { ENV } from "./_core/env";

const SHIPPO_API = "https://api.goshippo.com";

// Rates are quoted from the ZIP code, so the P.O. Box line is left off.
// Confirm a carrier-pickup street address before label buying goes live.
const SHIP_FROM = {
  name: "KEMZOBO",
  street1: "13520 McLearen Road",
  city: "Herndon",
  state: "VA",
  zip: "20171",
  country: "US",
};

// Ground services only: USPS Ground Advantage, UPS Ground / Ground Saver, FedEx Ground / Home Delivery
function isGroundService(token: string): boolean {
  return token.includes("ground") || token === "fedex_home_delivery";
}

type ShippoRate = {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel: { name: string; token: string };
  estimated_days: number | null;
  duration_terms: string | null;
};

export type ShipToAddress = {
  name?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
};

export function isShippingConfigured(): boolean {
  return !!ENV.shippoApiToken;
}

function normalizeZip(zip: string): string {
  return zip.trim().slice(0, 5);
}

/**
 * Live ground rates for `boxes` cases going to `to`. Each case is its own box, so
 * the per-box rate is multiplied by the box count, then the handling fee is added once.
 */
export async function getShippingOptions(to: ShipToAddress, boxes: number): Promise<ShippingOption[]> {
  if (!isShippingConfigured()) throw new Error("Shipping rates are not configured");
  if (boxes < 1) return [];

  const res = await fetch(`${SHIPPO_API}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${ENV.shippoApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address_from: SHIP_FROM,
      address_to: {
        name: to.name || "Customer",
        street1: to.street,
        city: to.city,
        state: to.state,
        zip: to.zip,
        country: "US",
        phone: to.phone || undefined,
      },
      parcels: [CASE_PARCEL],
      async: false,
    }),
  });

  if (!res.ok) {
    console.error("[Shipping] Shippo shipment failed", res.status, await res.text());
    throw new Error("Couldn't get shipping rates right now. Please try again.");
  }

  const shipment = (await res.json()) as { rates?: ShippoRate[]; messages?: unknown[] };
  const ground = (shipment.rates ?? []).filter(
    (r) => r.currency === "USD" && isGroundService(r.servicelevel?.token ?? "")
  );
  if (ground.length === 0 && shipment.messages?.length) {
    console.warn("[Shipping] No ground rates", JSON.stringify(shipment.messages));
  }

  const options = await Promise.all(
    ground.map(async (r) => {
      const carrierAmount = Math.round(parseFloat(r.amount) * 100) * boxes;
      const amount = carrierAmount + HANDLING_FEE_CENTS;
      const quoteToken = await signQuote({
        rateId: r.object_id,
        carrier: r.provider,
        service: r.servicelevel.name,
        amount,
        boxes,
        zip: normalizeZip(to.zip),
      });
      return {
        quoteToken,
        carrier: r.provider,
        service: r.servicelevel.name,
        estimatedDays: r.estimated_days ?? null,
        durationTerms: r.duration_terms ?? null,
        amount,
        carrierAmount,
        boxes,
      };
    })
  );

  return options.sort((a, b) => a.amount - b.amount);
}

// ─── Signed quotes ─────────────────────────────────────────
// The browser hands the chosen quote back at order time; the signature stops it
// from being edited, and the box count + ZIP must still match the order.

type QuotePayload = {
  rateId: string;
  carrier: string;
  service: string;
  amount: number;
  boxes: number;
  zip: string;
};

const QUOTE_PURPOSE = "shipping-quote";

async function signQuote(q: QuotePayload): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new SignJWT({ ...q, purpose: QUOTE_PURPOSE })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("1h")
    .sign(secret);
}

export async function verifyQuote(
  token: string,
  expected: { boxes: number; zip: string }
): Promise<QuotePayload> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] }));
  } catch {
    throw new Error("Your shipping quote expired. Please choose a shipping option again.");
  }

  if (payload.purpose !== QUOTE_PURPOSE) throw new Error("Invalid shipping quote");
  const q = payload as unknown as QuotePayload;
  if (q.boxes !== expected.boxes || q.zip !== normalizeZip(expected.zip)) {
    throw new Error("Your cart or address changed. Please choose a shipping option again.");
  }
  return q;
}
