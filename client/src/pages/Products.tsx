import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { PRODUCT_CATEGORIES, formatPrice, getBulkPrice } from "@shared/const";
import { Truck, Minus, Plus, X, ShoppingCart, ArrowRight } from "lucide-react";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: products, isLoading } = trpc.products.list.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const { addItem, items: cartItems, removeItem, updateQuantity, subtotal: cartSubtotal, itemCount } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <PageMeta title="Shop" description="Explore KEMZOBO, THE ORIGINAL ZOBO DRINK — shop online and have KEMZOBO delivered nationwide." path="/products" />
      {/* Intro */}
      <div className="max-w-2xl mb-12">
        <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">Shop</p>
        <div className="flex items-center gap-3 mb-4"><div className="w-1 h-10 rounded-full bg-[#CC2936]" />
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
          KEMZOBO, THE ORIGINAL ZOBO DRINK
        </h1></div>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Explore KEMZOBO, THE ORIGINAL ZOBO DRINK — a bold, refreshing ready-to-drink
          hibiscus beverage inspired by tradition and made for modern moments. Shop online
          and have KEMZOBO delivered nationwide.
        </p>
      </div>

      {/* Delivery banner */}
      <div className="flex items-center gap-3 bg-hibiscus-bg rounded-xl px-5 py-3 mb-8 text-sm border border-hibiscus/10">
        <Truck className="h-5 w-5 text-hibiscus flex-shrink-0" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">Free delivery</span> on orders over $250. Ships nationwide.
        </span>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-[#CC2936] text-white"
              : "bg-hibiscus-bg text-muted-foreground hover:bg-hibiscus/10"
          }`}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? "bg-[#CC2936] text-white"
                : "bg-hibiscus-bg text-muted-foreground hover:bg-hibiscus/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product listing description */}
      <p className="text-muted-foreground text-sm mb-8">
        A bold and refreshing ready-to-drink hibiscus beverage crafted for everyday enjoyment
        and social moments. Best served cold.
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(v) =>
                addItem({
                  productId: product.id,
                  variantId: v.id,
                  productName: product.name,
                  variantName: v.name,
                  price: v.price,
                  imageUrl: product.imageUrl ?? undefined,
                })
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No products found. Check back soon!
        </p>
      )}

      {/* Inline cart review — appears below the product grid when there are items */}
      {cartItems.length > 0 && (
        <section className="mt-16 border-t border-[#CC2936]/10 pt-10">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-[#CC2936] text-xs uppercase tracking-[0.3em] font-bold mb-2">In your cart</p>
              <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
                Review your order ({itemCount} item{itemCount === 1 ? "" : "s"})
              </h2>
            </div>
            <Link
              href="/cart"
              className="text-sm font-medium text-[#CC2936] hover:underline"
            >
              Open full cart →
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
            {cartItems.map((item) => {
              const discountedUnit = getBulkPrice(item.price, item.quantity);
              const lineTotal = discountedUnit * item.quantity;
              const discountPct = item.price > 0 ? Math.round((1 - discountedUnit / item.price) * 100) : 0;
              return (
                <div
                  key={item.variantId}
                  className="flex flex-wrap items-center gap-4 p-4 border-b border-border last:border-b-0"
                >
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    {discountPct > 0 && (
                      <p className="text-xs font-semibold text-green-700 mt-1">
                        Bulk {discountPct}% off applied
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right w-24">
                    <p className="font-semibold text-foreground">${formatPrice(lineTotal)}</p>
                    {discountPct > 0 && (
                      <p className="text-xs text-muted-foreground line-through">${formatPrice(item.price * item.quantity)}</p>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-muted-foreground hover:text-red-500 p-1"
                    aria-label="Remove from cart"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {/* Subtotal + checkout */}
            <div className="bg-[#FAFAFA] p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Subtotal (pre-tax, pre-shipping)</p>
                <p className="font-display text-2xl font-bold text-foreground">${formatPrice(cartSubtotal)}</p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#E63946] transition-colors"
              >
                <ShoppingCart className="h-4 w-4" /> Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
