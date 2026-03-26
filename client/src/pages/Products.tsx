import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { PRODUCT_CATEGORIES } from "@shared/const";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: products, isLoading } = trpc.products.list.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const { addItem } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Our Drinks
      </h1>
      <p className="text-muted-foreground mb-8">
        Premium hibiscus drinks in a variety of flavors.
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !selectedCategory
              ? "bg-hibiscus text-white"
              : "bg-muted text-muted-foreground hover:bg-hibiscus/10"
          }`}
        >
          All
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? "bg-hibiscus text-white"
                : "bg-muted text-muted-foreground hover:bg-hibiscus/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() =>
                addItem({
                  productId: product.id,
                  variantId: 0,
                  productName: product.name,
                  variantName: "Default",
                  price: 0,
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
    </div>
  );
}
