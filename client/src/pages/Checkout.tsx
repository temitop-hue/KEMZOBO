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
import { CreditCard, ArrowRight, Copy, Check } from "lucide-react";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// ─── Stripe Payment Form ──────────────────────────────────
function StripePaymentForm({ orderNumber, total, onSuccess }: {
  orderNumber: string; total: number; onSuccess: () => void;
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
      confirmParams: { return_url: `${window.location.origin}/order-confirmation/${orderNumber}` },
      redirect: "if_required",
    });
    if (error) { toast.error(error.message || "Payment failed"); setProcessing(false); }
    else { onSuccess(); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-[#DC2626]/10 bg-white p-5 mb-4">
        <PaymentElement />
      </div>
      <button type="submit" disabled={processing || !stripe}
        className="btn-primary w-full rounded-full bg-[#DC2626] text-white py-4 font-bold text-lg hover:bg-[#EF4444] transition-all disabled:opacity-50">
        {processing ? "Processing..." : `Pay $${formatPrice(total)}`}
      </button>
    </form>
  );
}

// ─── Main Checkout ────────────────────────────────────────
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [shipping, setShipping] = useState({ name: "", street: "", city: "", state: "", zip: "", phone: "" });
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "zelle">("card");
  const [zelleCopied, setZelleCopied] = useState(false);
  const [orderData, setOrderData] = useState<{
    clientSecret: string | null; orderNumber: string; total: number;
  } | null>(null);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setOrderData({
        clientSecret: data.clientSecret,
        orderNumber: data.orderNumber,
        total: data.total,
      });
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

  const deliveryFee = subtotal >= 25000 ? 0 : 599;
  const tax = Math.round(subtotal * 0.06);
  const total = subtotal + deliveryFee + tax;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate({
      customerEmail: email,
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      shippingAddress: shipping,
    });
  };

  const copyZelle = () => {
    navigator.clipboard.writeText("temitop@gmail.com");
    setZelleCopied(true);
    toast.success("Zelle email copied!");
    setTimeout(() => setZelleCopied(false), 3000);
  };

  // ─── Step 2: Payment ────────────────────────────────────
  if (orderData) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <PageMeta title="Complete Payment" path="/checkout" />

        {/* Order summary card */}
        <div className="rounded-2xl border border-[#DC2626]/10 bg-hibiscus-bg p-6 mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Order</span>
            <span className="font-semibold text-foreground">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-2xl mt-2">
            <span>Total</span>
            <span className="text-[#DC2626]">${formatPrice(orderData.total)}</span>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              paymentMethod === "card"
                ? "bg-[#DC2626] text-white shadow-lg"
                : "bg-hibiscus-bg text-muted-foreground hover:bg-[#DC2626]/10 border border-[#DC2626]/10"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Card Payment
          </button>
          <button
            onClick={() => setPaymentMethod("zelle")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              paymentMethod === "zelle"
                ? "bg-[#DC2626] text-white shadow-lg"
                : "bg-hibiscus-bg text-muted-foreground hover:bg-[#DC2626]/10 border border-[#DC2626]/10"
            }`}
          >
            💸 Zelle / Venmo
          </button>
        </div>

        {/* Card payment */}
        {paymentMethod === "card" && (
          <>
            {stripePromise && orderData.clientSecret ? (
              <Elements stripe={stripePromise} options={{
                clientSecret: orderData.clientSecret,
                appearance: { theme: "stripe", variables: { colorPrimary: "#DC2626", borderRadius: "10px" } },
              }}>
                <StripePaymentForm
                  orderNumber={orderData.orderNumber}
                  total={orderData.total}
                  onSuccess={() => { clearCart(); setLocation(`/order-confirmation/${orderData.orderNumber}`); }}
                />
              </Elements>
            ) : (
              <div className="rounded-2xl border border-[#DC2626]/10 bg-white p-8 text-center">
                <CreditCard className="h-10 w-10 text-[#DC2626]/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Card payments are being set up. Please use Zelle for now.</p>
                <button onClick={() => setPaymentMethod("zelle")}
                  className="btn-primary rounded-full bg-[#DC2626] text-white px-6 py-3 font-semibold hover:bg-[#EF4444] transition-all">
                  Pay with Zelle
                </button>
              </div>
            )}
          </>
        )}

        {/* Zelle payment */}
        {paymentMethod === "zelle" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#DC2626]/10 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Pay via Zelle</h3>

              <div className="bg-hibiscus-bg rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Send payment to:</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-lg">temitop@gmail.com</span>
                  <button onClick={copyZelle} className="flex items-center gap-1.5 text-sm text-[#DC2626] font-medium hover:underline">
                    {zelleCopied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="bg-hibiscus-bg rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Amount:</p>
                <p className="font-display font-bold text-2xl text-[#DC2626]">${formatPrice(orderData.total)}</p>
              </div>

              <div className="bg-hibiscus-bg rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Memo / Note:</p>
                <p className="font-semibold text-foreground">KEMZOBO — {orderData.orderNumber}</p>
              </div>

              <div className="border-t border-[#DC2626]/10 pt-4">
                <h4 className="font-semibold text-foreground text-sm mb-3">Steps:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                    <span>Open your Zelle or Venmo app</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                    <span>Send <strong className="text-foreground">${formatPrice(orderData.total)}</strong> to <strong className="text-foreground">temitop@gmail.com</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                    <span>Include <strong className="text-foreground">KEMZOBO — {orderData.orderNumber}</strong> in the memo</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                    <span>We'll confirm your order within 24 hours</span>
                  </li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => { clearCart(); setLocation(`/order-confirmation/${orderData.orderNumber}`); }}
              className="btn-primary w-full rounded-full bg-[#DC2626] text-white py-4 font-bold text-lg hover:bg-[#EF4444] transition-all flex items-center justify-center gap-2"
            >
              I've Sent the Payment <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Your order will be confirmed once we receive and verify the payment.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Step 1: Shipping & Order Summary ───────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <PageMeta title="Checkout" path="/checkout" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <form onSubmit={handleCreateOrder}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Info */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold mb-2">Shipping Address</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
              <input type="text" required value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Street Address *</label>
              <input type="text" required value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">City *</label>
                <input type="text" required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">State *</label>
                <input type="text" required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                  className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">ZIP *</label>
                <input type="text" required value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                  className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone *</label>
                <input type="tel" required value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  className="w-full rounded-lg border border-[#DC2626]/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:bg-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
            <div className="rounded-2xl border border-[#DC2626]/10 bg-hibiscus-bg p-5 space-y-3">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span className="font-medium">${formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-[#DC2626]/10 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">Free</span> : `$${formatPrice(deliveryFee)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (est.)</span>
                  <span>${formatPrice(tax)}</span>
                </div>
                <div className="border-t border-[#DC2626]/10 pt-2 flex justify-between font-display font-bold text-xl">
                  <span>Total</span>
                  <span className="text-[#DC2626]">${formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment method preview */}
            <div className="mt-6 rounded-xl bg-white border border-[#DC2626]/10 p-4">
              <p className="text-sm text-muted-foreground mb-2">Payment methods available:</p>
              <div className="flex gap-3">
                <span className="text-xs font-medium bg-hibiscus-bg text-[#DC2626] rounded-full px-3 py-1">💳 Card (Stripe)</span>
                <span className="text-xs font-medium bg-hibiscus-bg text-[#DC2626] rounded-full px-3 py-1">💸 Zelle / Venmo</span>
              </div>
            </div>

            <button type="submit" disabled={createOrderMutation.isPending}
              className="btn-primary mt-6 w-full rounded-full bg-[#DC2626] text-white py-4 font-bold text-lg hover:bg-[#EF4444] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {createOrderMutation.isPending ? "Creating Order..." : <>Continue to Payment <ArrowRight className="h-5 w-5" /></>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
