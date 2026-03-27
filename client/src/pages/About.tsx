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

      {/* Heritage story with image */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              The Hibiscus Heritage
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Zobo is a beloved hibiscus drink that has been a staple in West African culture for
              generations. Made from dried hibiscus flowers (Hibiscus sabdariffa), it's known for
              its vibrant deep red color, tangy-sweet flavor, and incredible health benefits.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From family gatherings to celebrations, Zobo brings people together. At
              <span className="italic"> Kem</span> Original Zobo, we've brought this cherished
              tradition to a convenient 16 oz can — so you can enjoy it anywhere, anytime.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/images/heritage-glass.jpg"
              alt="Zobo drink with traditional Nigerian cap and fabric"
              className="w-full h-[380px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Health benefits */}
      <section className="bg-gold-light/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
              <img
                src="/images/tropical-glass.jpg"
                alt="Zobo drink in natural tropical setting"
                className="w-full h-[380px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                Health Benefits of Hibiscus
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-earth-green font-bold text-lg">+</span>
                  <span>Rich in Vitamin C and powerful antioxidants</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-earth-green font-bold text-lg">+</span>
                  <span>Supports healthy blood pressure levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-earth-green font-bold text-lg">+</span>
                  <span>Aids digestion and metabolism</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-earth-green font-bold text-lg">+</span>
                  <span>Naturally caffeine-free</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-earth-green font-bold text-lg">+</span>
                  <span>Low in calories, no added sugars</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lifestyle / community */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Making <span className="italic">Kem</span> Zobo the leading brand in its niche and the go-to
              choice for healthy nutrition and hydration. Each 16 oz can is crafted with care,
              using premium hibiscus flowers and natural ingredients.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No artificial flavors. No preservatives. Just 473 ml of pure, refreshing
              heritage — connecting communities through the taste of tradition.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/images/lifestyle-friends.jpg"
              alt="Friends enjoying Kem Zobo drinks together"
              className="w-full h-[380px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Bar glass — full width */}
      <section className="relative h-[350px] overflow-hidden">
        <img
          src="/images/bar-glass.jpg"
          alt="Zobo drink beautifully presented"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              Taste the Tradition
            </h2>
            <p className="text-white/80 mb-6 max-w-md">
              Fostering storytelling and connection with every sip.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-hibiscus px-6 py-3 font-bold hover:bg-cream transition-colors"
            >
              Shop Our Drinks <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
