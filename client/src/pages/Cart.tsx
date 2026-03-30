import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getBulkPrice } from "@shared/const";

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <PageMeta title="Cart" path="/cart" />
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some drinks to get started!</p>
        <Link
          href="/products"
          className="inline-block rounded-lg bg-hibiscus text-white px-6 py-2.5 font-semibold hover:bg-hibiscus-light transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageMeta title="Cart" path="/cart" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-8">
        Your Cart ({itemCount} items)
      </h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const unitPrice = getBulkPrice(item.price, item.quantity);
          const lineTotal = unitPrice * item.quantity;
          const hasBulkDiscount = unitPrice < item.price;

          return (
            <div
              key={item.variantId}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              {/* Image */}
              <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🌺</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.productName}</h3>
                <p className="text-sm text-muted-foreground">{item.variantName}</p>
                {hasBulkDiscount && (
                  <p className="text-xs text-earth-green font-medium mt-0.5">
                    Bulk discount applied!
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="rounded border border-border p-1 hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  className="rounded border border-border p-1 hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-display font-bold">${formatPrice(lineTotal)}</div>
                {hasBulkDiscount && (
                  <div className="text-xs text-muted-foreground line-through">
                    ${formatPrice(item.price * item.quantity)}
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.variantId)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-medium">
            {subtotal >= 5000 ? "Free" : `$${formatPrice(599)}`}
          </span>
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between">
          <span className="font-display font-bold text-lg">Estimated Total</span>
          <span className="font-display font-bold text-lg">
            ${formatPrice(subtotal + (subtotal >= 5000 ? 0 : 599))}
          </span>
        </div>
        <div className="mt-6 flex gap-4">
          <Link
            href="/products"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/checkout"
            className="flex-1 rounded-lg bg-hibiscus text-white px-6 py-2.5 text-center font-semibold hover:bg-hibiscus-light transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
