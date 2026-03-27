import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-hibiscus/5 to-gold-light/30 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our <span className="italic text-hibiscus">Story</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Infusing heritage, culture, and themes that reflect everyday living —
            <span className="italic"> Kem</span> Original Zobo brings authentic hibiscus refreshment to your doorstep.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            The Hibiscus Heritage
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Zobo is a beloved hibiscus drink that has been a staple in West African culture for
            generations. Made from dried hibiscus flowers (Hibiscus sabdariffa), it's known for
            its vibrant deep red color, tangy-sweet flavor, and incredible health benefits.
            From family gatherings to celebrations, Zobo brings people together.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Health Benefits of Hibiscus
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-earth-green font-bold">+</span>
              <span>Rich in Vitamin C and antioxidants</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-earth-green font-bold">+</span>
              <span>Supports healthy blood pressure levels</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-earth-green font-bold">+</span>
              <span>Aids digestion and metabolism</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-earth-green font-bold">+</span>
              <span>Naturally caffeine-free</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-earth-green font-bold">+</span>
              <span>Low in calories, no added sugars</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Making <span className="italic">Kem</span> Zobo the leading brand in its niche and the go-to
            choice for healthy nutrition and hydration. Each 16 oz can is crafted with care,
            using premium hibiscus flowers and natural ingredients — no artificial flavors,
            no preservatives. Just 473 ml of pure, refreshing heritage.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-4">
            Taste the Tradition
          </h2>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-hibiscus text-white px-6 py-3 font-semibold hover:bg-hibiscus-light transition-colors"
          >
            Shop Our Drinks <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
