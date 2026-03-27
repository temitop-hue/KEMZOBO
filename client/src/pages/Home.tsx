import { Link } from "wouter";
import { ArrowRight, Leaf, Heart, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { addItem } = useCart();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-hibiscus/5 via-background to-gold-light/40 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-hibiscus uppercase tracking-widest mb-4">
              Made with a blend of nature's finest hibiscus
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="italic text-hibiscus">Kem</span> Original{" "}
              <span className="text-hibiscus">Zobo</span> Drink
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              16 FL. OZ of heritage in every can. Infused with culture, crafted for
              healthy hydration — the go-to choice for refreshment.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-hibiscus text-white px-6 py-3 font-semibold hover:bg-hibiscus-light transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-hibiscus text-hibiscus px-6 py-3 font-semibold hover:bg-hibiscus/5 transition-colors"
              >
                Wholesale Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Zobo */}
      <section className="py-16 bg-gold-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">
            Why <span className="italic text-hibiscus">Kem</span> Zobo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-earth-green/10 text-earth-green flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-7 w-7" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">100% Natural</h3>
              <p className="text-sm text-muted-foreground">
                Made from real hibiscus flowers with no artificial flavors, colors, or preservatives.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-hibiscus/10 text-hibiscus flex items-center justify-center mx-auto mb-4">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Rich in Antioxidants</h3>
              <p className="text-sm text-muted-foreground">
                Hibiscus is packed with vitamin C and antioxidants that support your health naturally.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Heritage & Culture</h3>
              <p className="text-sm text-muted-foreground">
                A beloved West African tradition — infusing heritage, culture, and everyday living into every can.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground">
                Featured Drinks
              </h2>
              <Link
                href="/products"
                className="text-sm font-medium text-hibiscus hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
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
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-hibiscus text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            The Go-To Choice for Healthy Hydration
          </h2>
          <p className="text-white/80 mb-8">
            Order online for delivery, or connect with us for wholesale and event orders.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-hibiscus px-8 py-3 font-bold hover:bg-cream transition-colors"
          >
            Order Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
