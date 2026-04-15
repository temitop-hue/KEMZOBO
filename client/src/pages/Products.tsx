import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { PRODUCT_CATEGORIES } from "@shared/const";
import { Truck } from "lucide-react";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: products, isLoading } = trpc.products.list.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );
  const { addItem } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <PageMeta title="Shop" description="Explore KEMZOBO, THE ORIGINAL ZOBO DRINK — shop online and have KEMZOBO delivered nationwide." path="/products" />
      {/* Intro */}
      <div className="max-w-2xl mb-12">
        <p className="text-[#DC2626] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">Shop</p>
        <div className="flex items-center gap-3 mb-4"><div className="w-1 h-10 rounded-full bg-[#DC2626]" />
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
              ? "bg-[#DC2626] text-white"
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
                ? "bg-[#DC2626] text-white"
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
