import { Link } from "wouter";
import { ShoppingCart, Truck } from "lucide-react";
import { formatPrice } from "@shared/const";
import type { Product, ProductVariant } from "@shared/types";

interface ProductCardProps {
  product: Product & { variants?: ProductVariant[] };
  variant?: ProductVariant;
  onAddToCart?: (variant: ProductVariant) => void;
}

export default function ProductCard({ product, variant, onAddToCart }: ProductCardProps) {
  const variants = product.variants ?? [];
  const cheapestCase = variants.find((v) => /case/i.test(v.name) && v.isActive);
  const cheapestSingle = variants.find((v) => /single|can/i.test(v.name) && v.isActive);
  const fallback = variants.find((v) => v.isActive) ?? variants[0];
  const displayVariant = variant ?? cheapestCase ?? fallback;
  const singleCanLabel = cheapestSingle && cheapestSingle.id !== displayVariant?.id
    ? `or $${formatPrice(cheapestSingle.price)} / can`
    : null;

  const price = displayVariant?.price;
  const compareAtPrice = displayVariant?.compareAtPrice;
  const quantityLabel = displayVariant?.weight || displayVariant?.name;

  return (
    <div className="group card-hover rounded-xl border border-border bg-card overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">🌺</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <span className="inline-block text-xs font-medium text-hibiscus bg-hibiscus/10 rounded-full px-2 py-0.5 mb-2">
            {product.category}
          </span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold text-foreground hover:text-hibiscus transition-colors">
            {product.name}
          </h3>
        </Link>

        {quantityLabel && (
          <p className="text-xs font-medium text-muted-foreground mt-1">{quantityLabel}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-2">
              {price != null && (
                <span className="font-display font-bold text-lg text-foreground">
                  ${formatPrice(price)}
                </span>
              )}
              {compareAtPrice != null && compareAtPrice > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  ${formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
            {singleCanLabel && (
              <span className="text-[11px] text-muted-foreground">{singleCanLabel}</span>
            )}
          </div>

          {onAddToCart && displayVariant && (
            <button
              onClick={() => onAddToCart(displayVariant)}
              className="rounded-lg bg-[#CC2936] text-white p-2 hover:bg-[#E63946] transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#CC2936]">
          <Truck className="h-3 w-3" />
          <span>Ships nationwide</span>
        </div>
      </div>
    </div>
  );
}
