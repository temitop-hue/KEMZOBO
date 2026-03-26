import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  useAuth({ redirectOnUnauthenticated: true });
  const { data: order, isLoading } = trpc.orders.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-muted rounded w-1/3" /></div>;
  }

  if (!order) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">Order not found.</div>;
  }

  const statusSteps = ["pending", "processing", "shipped", "delivered"];
  const currentStep = statusSteps.indexOf(order.status ?? "pending");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Payment: <span className="capitalize">{order.paymentStatus}</span>
      </p>

      {/* Status tracker */}
      <div className="flex items-center mb-8">
        {statusSteps.map((step, i) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= currentStep ? "bg-hibiscus text-white" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            {i < statusSteps.length - 1 && (
              <div className={`flex-1 h-1 mx-1 ${
                i < currentStep ? "bg-hibiscus" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-8 px-2">
        {statusSteps.map((s) => <span key={s} className="capitalize">{s}</span>)}
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <p className="text-sm"><strong>Tracking:</strong> {order.trackingNumber}</p>
          {order.trackingCarrier && <p className="text-sm text-muted-foreground">{order.trackingCarrier}</p>}
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h3 className="font-display font-semibold mb-4">Items</h3>
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm border-b border-border last:border-0">
            <span>{item.productName} ({item.variantName}) x{item.quantity}</span>
            <span>${formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee ? `$${formatPrice(order.deliveryFee)}` : "Free"}</span></div>
          {order.tax ? <div className="flex justify-between"><span>Tax</span><span>${formatPrice(order.tax)}</span></div> : null}
          <div className="flex justify-between font-bold text-base pt-2"><span>Total</span><span>${formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Shipping */}
      {order.shippingAddress && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display font-semibold mb-2 text-sm">Shipping Address</h3>
          <p className="text-sm text-muted-foreground">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
        </div>
      )}
    </div>
  );
}
