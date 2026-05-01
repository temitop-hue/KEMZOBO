import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { RotateCcw, X, MapPin, Package, Truck, Phone, Mail } from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return map[s] ?? "bg-gray-100 text-gray-500";
};

const paymentBadge = (s: string) => {
  if (s === "paid") return "bg-green-50 text-green-700";
  if (s === "refunded") return "bg-gray-100 text-gray-600";
  return "bg-amber-50 text-amber-700";
};

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const refundMutation = trpc.admin.orders.refund.useMutation({
    onSuccess: (data) => {
      const msg =
        data.method === "stripe"
          ? "Stripe refund issued. Customer notified."
          : "Marked as refunded. Send Zelle reversal manually.";
      toast.success(msg);
      utils.admin.orders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setRefundingId(null),
  });

  const handleRefund = (id: number, orderNumber: string, total: number) => {
    const confirmed = window.confirm(
      `Refund order ${orderNumber} for $${formatPrice(total)}?\n\nThis cannot be undone. For card payments the customer is refunded automatically; for Zelle/Venmo you must reverse the payment manually.`
    );
    if (!confirmed) return;
    setRefundingId(id);
    refundMutation.mutate({ id });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex items-center gap-3"><div className="w-1 h-8 rounded-full bg-[#CC2936]" /><h1 className="font-display text-2xl font-bold">Orders</h1></div>
        {orders && (
          <p className="text-sm text-muted-foreground">{orders.length} total</p>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-white">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-white">Status</th>
                <th className="text-left px-4 py-3 font-medium text-white">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-white">Total</th>
                <th className="text-left px-4 py-3 font-medium text-white">Date</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setOpenId(o.id)}
                  className="border-t border-border hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customerEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(o.status ?? "pending")}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${paymentBadge(o.paymentStatus ?? "unpaid")}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.createdAt ? format(new Date(o.createdAt), "MMM d") : ""}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setOpenId(o.id)}
                        className="text-xs font-medium text-[#CC2936] hover:underline"
                      >
                        View
                      </button>
                      {o.paymentStatus === "paid" && (
                        <button
                          onClick={() => handleRefund(o.id, o.orderNumber, o.total)}
                          disabled={refundingId === o.id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936] hover:text-white text-xs font-medium px-2.5 py-1 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {refundingId === o.id ? "..." : "Refund"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      )}

      {openId !== null && (
        <OrderDetailModal id={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

function OrderDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.orders.getById.useQuery({ id });

  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");

  const updateStatus = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.admin.orders.list.invalidate();
      utils.admin.orders.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTracking = trpc.admin.orders.updateTracking.useMutation({
    onSuccess: () => {
      toast.success("Tracking saved. Order marked as shipped.");
      utils.admin.orders.list.invalidate();
      utils.admin.orders.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const order = data;
  const addr = order?.shippingAddress;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl mb-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#CC2936] text-white">
          <div>
            <h2 className="font-display text-lg font-bold">
              {order?.orderNumber || "Order"}
            </h2>
            {order?.createdAt && (
              <p className="text-xs text-white/80 mt-0.5">
                Placed {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !order ? (
          <div className="p-8 text-center text-muted-foreground">Loading order details...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge(order.status ?? "pending")}`}>
                {order.status}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${paymentBadge(order.paymentStatus ?? "unpaid")}`}>
                {order.paymentStatus}
              </span>
            </div>

            {/* Customer + Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-3">Customer</p>
                <div className="space-y-2 text-sm">
                  {addr?.name && (
                    <div className="font-semibold text-foreground">{addr.name}</div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={`mailto:${order.customerEmail}`} className="hover:text-[#CC2936] hover:underline break-all">
                      {order.customerEmail}
                    </a>
                  </div>
                  {addr?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <a href={`tel:${addr.phone}`} className="hover:text-[#CC2936] hover:underline">
                        {addr.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-3">Shipping address</p>
                {addr ? (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-foreground font-medium">{addr.street}</div>
                        <div>{addr.city}, {addr.state} {addr.zip}</div>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-[#CC2936] hover:underline mt-1"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No shipping address.</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border overflow-hidden">
              <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] px-4 pt-4 mb-2 flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Items
              </p>
              <table className="w-full text-sm">
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{item.variantName}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">×{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${formatPrice(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#FAFAFA]">
                  <tr className="border-t border-border">
                    <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground text-xs">Subtotal</td>
                    <td className="px-4 py-2 text-right">${formatPrice(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground text-xs">Delivery</td>
                    <td className="px-4 py-2 text-right">${formatPrice(order.deliveryFee ?? 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-right text-muted-foreground text-xs">Tax</td>
                    <td className="px-4 py-2 text-right">${formatPrice(order.tax ?? 0)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td colSpan={2} className="px-4 py-2 text-right font-bold">Total</td>
                    <td className="px-4 py-2 text-right font-bold">${formatPrice(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Status changer */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-3">Update status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((s) => (
                  <button
                    key={s}
                    disabled={updateStatus.isPending || order.status === s}
                    onClick={() => updateStatus.mutate({ id: order.id, status: s })}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors disabled:opacity-50 ${
                      order.status === s
                        ? "bg-[#CC2936] text-white cursor-default"
                        : "bg-white border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936] hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking */}
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-3 flex items-center gap-2">
                <Truck className="h-3.5 w-3.5" /> Tracking
              </p>
              {order.trackingNumber ? (
                <p className="text-sm text-muted-foreground mb-3">
                  Current: <span className="font-mono text-foreground">{order.trackingNumber}</span>
                  {order.trackingCarrier && <> via {order.trackingCarrier}</>}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">No tracking added yet.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936] sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="Carrier (USPS, UPS...)"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                />
              </div>
              <button
                onClick={() => {
                  if (!trackingNumber) {
                    toast.error("Tracking number required");
                    return;
                  }
                  updateTracking.mutate({
                    id: order.id,
                    trackingNumber,
                    trackingCarrier: trackingCarrier || undefined,
                  });
                  setTrackingNumber("");
                  setTrackingCarrier("");
                }}
                disabled={updateTracking.isPending}
                className="mt-3 rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
              >
                {updateTracking.isPending ? "Saving..." : "Save tracking & mark shipped"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
