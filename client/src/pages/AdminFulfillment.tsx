import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";
import { Package, Truck, MapPin, ChevronDown, ChevronUp, Printer } from "lucide-react";

export default function AdminFulfillment() {
  const utils = trpc.useUtils();
  const { data: queue, isLoading } = trpc.admin.fulfillment.queue.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<Record<number, { number: string; carrier: string }>>({});

  const markPacked = trpc.admin.fulfillment.markPacked.useMutation({
    onSuccess: () => {
      toast.success("Marked packed");
      utils.admin.fulfillment.queue.invalidate();
      utils.admin.orders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const markShipped = trpc.admin.fulfillment.markShipped.useMutation({
    onSuccess: () => {
      toast.success("Shipped — customer will be notified by tracking email");
      utils.admin.fulfillment.queue.invalidate();
      utils.admin.orders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const sections = {
    "To pack": queue?.filter((o) => o.status === "pending" || o.status === "processing") ?? [],
    "Ready to ship": queue?.filter((o) => o.status === "packed") ?? [],
  };

  const setTracking = (id: number, key: "number" | "carrier", value: string) => {
    setTrackingDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], number: prev[id]?.number ?? "", carrier: prev[id]?.carrier ?? "", [key]: value },
    }));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Fulfillment Queue</h1>
        </div>
        <div className="flex items-center gap-3">
          {queue && (
            <p className="text-sm text-muted-foreground">{queue.length} awaiting fulfillment</p>
          )}
          <Link
            href="/admin/fulfillment/print"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936] hover:text-white text-xs font-semibold px-3 py-1.5 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print pack lists
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl" />)}
        </div>
      ) : queue && queue.length > 0 ? (
        <div className="space-y-10">
          {Object.entries(sections).map(([title, orders]) => (
            <section key={title}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
                <span className="text-xs font-medium bg-[#CC2936]/10 text-[#CC2936] rounded-full px-2.5 py-0.5">
                  {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Nothing here.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => {
                    const expanded = expandedId === o.id;
                    const draft = trackingDraft[o.id] ?? { number: "", carrier: "" };
                    return (
                      <div key={o.id} className="bg-white rounded-xl border border-[#CC2936]/10 overflow-hidden">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-4 p-4">
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-foreground">{o.orderNumber}</span>
                              <span className="text-xs text-muted-foreground">
                                {o.createdAt && format(new Date(o.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {o.shippingAddress?.name} &middot; {o.customerEmail}
                            </div>
                          </div>

                          <div className="text-sm text-right">
                            <div className="font-bold text-foreground">${formatPrice(o.total)}</div>
                            <div className="text-xs text-muted-foreground">{o.items?.length ?? 0} item{(o.items?.length ?? 0) === 1 ? "" : "s"}</div>
                          </div>

                          {/* Action buttons */}
                          {o.status !== "packed" ? (
                            <button
                              onClick={() => markPacked.mutate({ id: o.id })}
                              disabled={markPacked.isPending}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
                            >
                              <Package className="h-4 w-4" /> Mark Packed
                            </button>
                          ) : (
                            <span className="text-xs font-medium bg-purple-50 text-purple-700 rounded-full px-2.5 py-1">
                              Packed {o.packedAt && format(new Date(o.packedAt), "MMM d")}
                            </span>
                          )}

                          <button
                            onClick={() => setExpandedId(expanded ? null : o.id)}
                            className="text-muted-foreground hover:text-[#CC2936] p-1"
                          >
                            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>

                        {/* Expanded detail */}
                        {expanded && (
                          <div className="border-t border-border bg-[#FAFAFA] p-4 space-y-4">
                            {/* Items list */}
                            <div>
                              <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2">Pack list</p>
                              <ul className="text-sm space-y-1">
                                {o.items?.map((it) => (
                                  <li key={it.id} className="flex justify-between">
                                    <span className="text-foreground">
                                      <strong>×{it.quantity}</strong> {it.productName} <span className="text-muted-foreground">({it.variantName})</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Address */}
                            {o.shippingAddress && (
                              <div>
                                <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2 flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5" /> Ship to
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  <div className="font-medium text-foreground">{o.shippingAddress.name}</div>
                                  <div>{o.shippingAddress.street}</div>
                                  <div>{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</div>
                                  {o.shippingAddress.phone && <div className="mt-1">📞 {o.shippingAddress.phone}</div>}
                                </div>
                              </div>
                            )}

                            {/* Ship action (only when packed) */}
                            {o.status === "packed" && (
                              <div className="rounded-lg border border-[#CC2936]/15 bg-white p-3">
                                <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2 flex items-center gap-1.5">
                                  <Truck className="h-3.5 w-3.5" /> Ship now
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Tracking number *"
                                    value={draft.number}
                                    onChange={(e) => setTracking(o.id, "number", e.target.value)}
                                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936] sm:col-span-2"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Carrier (USPS, UPS...)"
                                    value={draft.carrier}
                                    onChange={(e) => setTracking(o.id, "carrier", e.target.value)}
                                    className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    if (!draft.number) {
                                      toast.error("Tracking number required");
                                      return;
                                    }
                                    markShipped.mutate({
                                      id: o.id,
                                      trackingNumber: draft.number,
                                      trackingCarrier: draft.carrier || undefined,
                                    });
                                  }}
                                  disabled={markShipped.isPending}
                                  className="mt-3 rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
                                >
                                  {markShipped.isPending ? "Shipping..." : "Mark shipped"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Package className="h-10 w-10 text-[#CC2936]/30 mx-auto mb-3" />
          <p className="text-foreground font-medium">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No paid orders waiting on fulfillment.</p>
        </div>
      )}
    </div>
  );
}
