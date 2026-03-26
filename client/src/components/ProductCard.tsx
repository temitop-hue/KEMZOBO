import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@shared/const";
import type { Product, ProductVariant } from "@shared/types";

interface ProductCardProps {
  product: Product;
  variant?: ProductVariant;
  onAddToCart?: () => void;
}

export default function ProductCard({ product, variant, onAddToCart }: ProductCardProps) {
  const price = variant?.price;
  const compareAtPrice = variant?.compareAtPrice;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
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

        {variant && (
          <p className="text-xs text-muted-foreground mt-1">{variant.name}</p>
        )}

        <div className="flex items-center justify-between mt-3">
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

          {onAddToCart && (
            <button
              onClick={onAddToCart}
              className="rounded-lg bg-hibiscus text-white p-2 hover:bg-hibiscus-light transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
