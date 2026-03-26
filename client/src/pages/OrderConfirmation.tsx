import { useParams } from "wouter";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { data: order, isLoading } = trpc.orders.confirmPayment.useQuery(
    { orderNumber: orderNumber ?? "" },
    { enabled: !!orderNumber }
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
          <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <CheckCircle className="h-16 w-16 text-earth-green mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you for your order. Your order number is{" "}
        <span className="font-semibold text-foreground">{order.orderNumber}</span>.
      </p>

      <div className="rounded-xl border border-border bg-card p-6 text-left mb-8">
        <h3 className="font-display font-semibold mb-4">Order Summary</h3>
        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>{item.productName} ({item.variantName}) x{item.quantity}</span>
            <span>${formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link
          href="/products"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/my-account"
          className="rounded-lg bg-hibiscus text-white px-6 py-2.5 text-sm font-semibold hover:bg-hibiscus-light transition-colors"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
