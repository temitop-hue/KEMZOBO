import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@shared/const";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// ─── Payment Form (inside Elements provider) ─────────────
function PaymentForm({
  orderNumber,
  total,
  onSuccess,
}: {
  orderNumber: string;
  total: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderNumber}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <PaymentElement />
      </div>
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full rounded-lg bg-hibiscus text-white py-3 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
      >
        {processing ? "Processing..." : `Pay $${formatPrice(total)}`}
      </button>
    </form>
  );
}

// ─── Main Checkout Page ──────────────────────────────────
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [shipping, setShipping] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [email, setEmail] = useState("");
  const [orderData, setOrderData] = useState<{
    clientSecret: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      if (data.clientSecret) {
        setOrderData({
          clientSecret: data.clientSecret,
          orderNumber: data.orderNumber,
          total: data.total,
        });
      } else {
        // No Stripe key configured — direct redirect
        clearCart();
        setLocation(`/order-confirmation/${data.orderNumber}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (items.length === 0 && !orderData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <PageMeta title="Checkout" path="/checkout" />
        <p className="text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  const deliveryFee = subtotal >= 5000 ? 0 : 599;
  const tax = Math.round(subtotal * 0.06);
  const total = subtotal + deliveryFee + tax;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate({
      customerEmail: email,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      shippingAddress: shipping,
    });
  };

  // ─── Step 2: Payment (after order created) ──────────────
  if (orderData) {
    if (stripePromise && orderData.clientSecret) {
      return (
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">
            Complete Payment
          </h1>
          <div className="rounded-xl border border-border bg-card p-4 mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium">{orderData.orderNumber}</span>
            </div>
            <div className="flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span>${formatPrice(orderData.total)}</span>
            </div>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: orderData.clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#7C2D12",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <PaymentForm
              orderNumber={orderData.orderNumber}
              total={orderData.total}
              onSuccess={() => {
                clearCart();
                setLocation(`/order-confirmation/${orderData.orderNumber}`);
              }}
            />
          </Elements>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Also accepting Zelle &amp; Venmo — contact us for details.
          </p>
        </div>
      );
    }

    // Stripe not configured — fallback
    clearCart();
    setLocation(`/order-confirmation/${orderData.orderNumber}`);
    return null;
  }

  // ─── Step 1: Shipping & Order Summary ───────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageMeta title="Checkout" path="/checkout" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleCreateOrder}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Info */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold mb-2">Shipping Address</h2>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name *</label>
              <input type="text" required value={shipping.name}
                onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Street Address *</label>
              <input type="text" required value={shipping.street}
                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City *</label>
                <input type="text" required value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State *</label>
                <input type="text" required value={shipping.state}
                  onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">ZIP *</label>
                <input type="text" required value={shipping.zip}
                  onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <input type="tel" required value={shipping.phone}
                  onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : `$${formatPrice(deliveryFee)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (est.)</span>
                  <span>${formatPrice(tax)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span>${formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className="mt-6 w-full rounded-lg bg-hibiscus text-white py-3 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
            >
              {createOrderMutation.isPending ? "Creating Order..." : "Continue to Payment"}
            </button>

            <p className="mt-4 text-xs text-muted-foreground text-center">
              Also accepting Zelle &amp; Venmo — contact us for details.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
