import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { Search, Package, Truck, Check, MapPin, ArrowRight } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending", label: "Order placed", icon: Check },
  { key: "processing", label: "Processing", icon: Package },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
] as const;

type Result = ReturnType<typeof trpc.orders.track.useMutation>["data"];

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const track = trpc.orders.track.useMutation({
    onSuccess: (data) => setResult(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track.mutate({ orderNumber: orderNumber.trim(), email: email.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <PageMeta
        title="Track Order"
        description="Look up the status of your KEMZOBO order with your order number and email."
        path="/track"
      />

      <div className="text-center mb-12">
        <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] mb-4">Track Order</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-3">Where's my KEMZOBO?</h1>
        <p className="text-muted-foreground text-lg">Enter your order number and the email you used to check out.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-[#CC2936]/10 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Order #</label>
            <input
              type="text" required value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full font-mono rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="KZ-10042"
              autoFocus
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="you@email.com"
            />
          </div>
        </div>
        <button
          type="submit" disabled={track.isPending}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> {track.isPending ? "Looking up..." : "Track order"}
        </button>
      </form>

      {/* Result */}
      {result && !result.ok && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
          <p className="text-amber-800 font-medium">{result.reason}</p>
          <p className="text-xs text-amber-700 mt-1">Double-check the order # and the email you used at checkout.</p>
        </div>
      )}

      {result && result.ok && (
        <OrderResult order={result.order} />
      )}
    </div>
  );
}

function OrderResult({ order }: { order: NonNullable<Extract<Result, { ok: true }>["order"]> }) {
  // Determine the active step in the progression
  const flowKeys = STATUS_STEPS.map((s) => s.key) as readonly string[];
  const currentIndex = order.status === "cancelled" ? -1 : flowKeys.indexOf(order.status ?? "pending");

  // Build clickable carrier tracking URL when possible
  const carrierUrl = (() => {
    if (!order.trackingNumber) return null;
    const c = (order.trackingCarrier ?? "").toLowerCase();
    if (c.includes("usps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
    if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
    if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
    if (c.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${order.trackingNumber}`;
    return null;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-[#CC2936]/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Order</p>
            <p className="font-display text-2xl font-bold text-foreground font-mono">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Placed {order.createdAt && format(new Date(order.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-display text-2xl font-bold text-[#CC2936]">${formatPrice(order.total)}</p>
            <p className="text-xs text-muted-foreground capitalize">{order.paymentStatus}</p>
          </div>
        </div>

        {/* Status timeline */}
        {order.status === "cancelled" ? (
          <div className="rounded-xl bg-gray-100 text-gray-700 p-4 text-center text-sm">
            This order was cancelled. If you have questions, email{" "}
            <a href="mailto:info@kemzobo.com" className="underline">info@kemzobo.com</a>.
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 mt-4">
            {STATUS_STEPS.map((step, i) => {
              const reached = i <= currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${
                      reached ? "bg-[#CC2936] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${reached ? "text-[#CC2936]" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tracking number link */}
        {order.trackingNumber && (
          <div className="mt-5 rounded-xl bg-[#FAFAFA] p-4 text-sm">
            <p className="text-muted-foreground">Tracking number</p>
            <p className="font-mono font-bold text-foreground mt-0.5">{order.trackingNumber}{order.trackingCarrier ? ` · ${order.trackingCarrier}` : ""}</p>
            {carrierUrl && (
              <a
                href={carrierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#CC2936] hover:underline mt-2"
              >
                Track with carrier <ArrowRight className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-2xl bg-white border border-[#CC2936]/10 overflow-hidden">
        <p className="px-5 py-3 text-xs uppercase tracking-wider font-bold text-[#CC2936] border-b border-border">Items</p>
        <table className="w-full text-sm">
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{it.productName}</p>
                  <p className="text-xs text-muted-foreground">{it.variantName}</p>
                </td>
                <td className="px-5 py-3 text-center text-muted-foreground">×{it.quantity}</td>
                <td className="px-5 py-3 text-right font-medium">${formatPrice(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="rounded-2xl bg-white border border-[#CC2936]/10 p-5">
          <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2">Shipping to</p>
          <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.street}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#CC2936] hover:underline"
        >
          Order again <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
