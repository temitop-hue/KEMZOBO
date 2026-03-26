import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getBulkPrice } from "@shared/const";
import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.products.getBySlug.useQuery({ slug: slug ?? "" });
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const selectedVariant =
    data.variants.find((v) => v.id === selectedVariantId) ?? data.variants[0];

  const bulkPrice = selectedVariant
    ? getBulkPrice(selectedVariant.price, quantity)
    : 0;
  const hasBulkDiscount = selectedVariant && bulkPrice < selectedVariant.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-xl overflow-hidden">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🌺</div>
          )}
        </div>

        {/* Info */}
        <div>
          {data.category && (
            <span className="text-sm font-medium text-hibiscus bg-hibiscus/10 rounded-full px-3 py-1">
              {data.category}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold mt-3 mb-4">{data.name}</h1>

          {data.description && (
            <p className="text-muted-foreground mb-6">{data.description}</p>
          )}

          {/* Variants */}
          {data.variants.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Size
              </label>
              <div className="flex flex-wrap gap-2">
                {data.variants
                  .filter((v) => v.isActive)
                  .map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        (selectedVariant?.id ?? 0) === v.id
                          ? "border-hibiscus bg-hibiscus/5 text-hibiscus"
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
            <label className="text-sm font-medium text-foreground mb-2 block">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-display text-lg font-bold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-lg border border-border p-2 hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Bulk discount feedback */}
            {hasBulkDiscount && (
              <p className="mt-2 text-sm text-earth-green font-medium">
                Bulk Discount Applied! Price per unit: ${formatPrice(bulkPrice)}
              </p>
            )}
          </div>

          {/* Price + Add to Cart */}
          {selectedVariant && (
            <div className="flex items-center gap-4">
              <div>
                <span className="font-display text-2xl font-bold">
                  ${formatPrice(bulkPrice * quantity)}
                </span>
                {hasBulkDiscount && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ${formatPrice(selectedVariant.price * quantity)}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
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
                }}
                className="flex items-center gap-2 rounded-lg bg-hibiscus text-white px-6 py-3 font-semibold hover:bg-hibiscus-light transition-colors"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
