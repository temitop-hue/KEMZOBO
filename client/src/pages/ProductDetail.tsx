import PageMeta from "@/components/PageMeta";
import { useParams } from "wouter";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getBulkPrice } from "@shared/const";
import { useState } from "react";
import { ShoppingCart, Minus, Plus, Truck, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.products.getBySlug.useQuery({ slug: slug ?? "" });
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="aspect-square bg-muted rounded-2xl" />
          <div className="space-y-4 py-8">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground text-lg">Product not found.</p>
        <Link href="/products" className="text-hibiscus font-semibold hover:underline mt-4 inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  const selectedVariant =
    data.variants.find((v) => v.id === selectedVariantId) ?? data.variants[0];

  const bulkPrice = selectedVariant
    ? getBulkPrice(selectedVariant.price, quantity)
    : 0;
  const hasBulkDiscount = selectedVariant && bulkPrice < selectedVariant.price;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(
      {
        productId: data.id,
        variantId: selectedVariant.id,
        productName: data.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        imageUrl: data.imageUrl ?? undefined,
      },
      quantity
    );
    toast.success(`${data.name} added to cart`);
  };

  return (
    <div>
      <PageMeta title={data?.name ?? "Product"} description="KEMZOBO brings the bold flavor of traditional zobo into a modern, convenient can." path={"/products/" + (slug ?? "")} />
      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Image */}
          <div className="aspect-square bg-hibiscus-bg rounded-2xl overflow-hidden">
            {data.imageUrl ? (
              <img src={data.imageUrl} alt={data.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🌺</div>
            )}
          </div>

          {/* Product info */}
          <div className="py-4">
            {/* Breadcrumb */}
            <p className="text-sm text-muted-foreground mb-4">
              <Link href="/products" className="hover:text-hibiscus">Shop</Link>
              {" / "}
              <span className="text-foreground">{data.name}</span>
            </p>

            {/* Headline */}
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {data.name}
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">
              KEMZOBO, THE ORIGINAL ZOBO DRINK
            </p>

            {/* Sales copy */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              KEMZOBO brings the bold flavor of traditional zobo into a modern, convenient can.
              Bright, refreshing, and designed to be enjoyed cold, it's the kind of drink that
              stands out at the table and fits effortlessly into everyday life. Whether you're
              bringing something different to a gathering or stocking your fridge with a
              refreshing go-to, KEMZOBO delivers a flavorful drinking experience rooted in
              culture and ready for now.
            </p>

            {/* Supporting points */}
            <div className="space-y-2.5 mb-8">
              {[
                "Bold hibiscus flavor with a refreshing finish",
                "Ready to drink and easy to share",
                "Perfect for gatherings, celebrations, and everyday moments",
                "Best enjoyed chilled or over ice",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-hibiscus flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{point}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-6" />

            {/* Variants */}
            {data.variants.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-foreground mb-3 block">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {data.variants
                    .filter((v) => v.isActive)
                    .map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          (selectedVariant?.id ?? 0) === v.id
                            ? "border-hibiscus bg-hibiscus/5 text-hibiscus shadow-sm"
                            : "border-border hover:border-hibiscus/50"
                        }`}
                      >
                        {v.name} — ${formatPrice(v.price)}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-foreground mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-border p-2.5 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-display text-lg font-bold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border border-border p-2.5 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Bulk discount feedback */}
              {hasBulkDiscount && (
                <div className="mt-3 bg-hibiscus/5 rounded-lg px-4 py-2.5 text-sm">
                  <span className="font-semibold text-hibiscus">Bulk Discount Applied!</span>
                  <span className="text-muted-foreground ml-2">
                    Price per unit: ${formatPrice(bulkPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Price + CTAs */}
            {selectedVariant && (
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-foreground">
                    ${formatPrice(bulkPrice * quantity)}
                  </span>
                  {hasBulkDiscount && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${formatPrice(selectedVariant.price * quantity)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 rounded-full bg-[#7F1D1D] text-white px-6 py-4 font-bold text-lg hover:bg-[#991B1B] transition-all"
                  >
                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                  </button>
                  <Link
                    href="/cart"
                    onClick={handleAddToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-foreground text-foreground px-6 py-4 font-bold text-lg hover:bg-foreground hover:text-white transition-all"
                  >
                    Buy Now <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Delivery info */}
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-hibiscus" />
              <span>Free delivery on orders over $250. Ships nationwide.</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to Enjoy — below product */}
      <section className="bg-hibiscus-bg py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6">
            How to Enjoy
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Enjoy KEMZOBO straight from the can, poured over ice, or served alongside
            your favorite meals and social moments. It's made for cookouts, brunches,
            parties, casual hangouts, and the everyday moments where good drinks belong.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Straight from the can", icon: "🥫" },
              { label: "Poured over ice", icon: "🧊" },
              { label: "Shared at gatherings", icon: "🎉" },
              { label: "Anytime refreshment", icon: "☀️" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-6 text-center border border-hibiscus/10">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
