import { Link } from "wouter";
import { ArrowRight, ChevronDown, Star, Truck, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", bounce: 0.3 } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── Hero Slideshow ───────────────────────────────────────
const heroSlides = [
  { src: "/images/hero-can.png", alt: "KEMZOBO can and glass", kenBurns: "scale-105" },
  { src: "/images/lifestyle-friends.jpg", alt: "Friends sharing KEMZOBO", kenBurns: "scale-110 translate-x-2" },
  { src: "/images/hero-can-alt.png", alt: "KEMZOBO product", kenBurns: "scale-105 -translate-x-1" },
  { src: "/images/tropical-glass.jpg", alt: "KEMZOBO refreshment", kenBurns: "scale-110 translate-y-2" },
  { src: "/images/heritage-glass.jpg", alt: "KEMZOBO heritage", kenBurns: "scale-105 translate-x-1" },
  { src: "/images/bar-glass.jpg", alt: "KEMZOBO at a gathering", kenBurns: "scale-110 -translate-y-1" },
];

function HeroSlideshow({
  heroRef,
  heroScale,
  heroOpacity,
}: {
  heroRef: React.RefObject<HTMLElement | null>;
  heroScale: any;
  heroOpacity: any;
}) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([0]));

  const advance = useCallback(() => {
    setCurrent((prev) => {
      const next = (prev + 1) % heroSlides.length;
      setLoaded((s) => new Set(s).add(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 5000);
    return () => clearInterval(timer);
  }, [advance]);

  // Preload next image
  useEffect(() => {
    const next = (current + 1) % heroSlides.length;
    if (!loaded.has(next)) {
      const img = new Image();
      img.src = heroSlides[next].src;
      setLoaded((s) => new Set(s).add(next));
    }
  }, [current, loaded]);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#0f0806]">
      {/* Crossfade image layers */}
      <motion.div style={{ scale: heroScale }} className="absolute inset-0">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                i === current ? slide.kenBurns : "scale-100"
              }`}
            />
          </div>
        ))}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0806] via-[#0f0806]/40 to-[#0f0806]/15 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0806]/70 via-[#0f0806]/25 to-transparent z-[1]" />

      {/* Content */}
      <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 flex flex-col justify-between">
        {/* Top: Logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-28">
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            src="/images/logo-dark.png"
            alt="KEMZOBO"
            className="h-14 lg:h-16 w-auto"
          />
        </div>

        {/* Bottom: Headline + CTAs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 lg:pb-28">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] max-w-3xl">
              Original Zobo.
              <br />
              <span className="text-hibiscus">Boldly</span> Refreshing.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-white/60 text-lg lg:text-xl max-w-xl leading-relaxed">
              Made for the moments that bring people together.
              Bold hibiscus. Timeless tradition. Ready to drink.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="btn-primary glow-pulse group inline-flex items-center gap-3 rounded-full bg-hibiscus text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-hibiscus-light transition-all"
              >
                Shop Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link
                href="/wholesale"
                className="btn-primary inline-flex items-center gap-3 rounded-full border-2 border-white/30 text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:border-white hover:bg-white/10 transition-all"
              >
                Order in Bulk
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-500 rounded-full ${
                i === current
                  ? "w-8 h-2 bg-hibiscus"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { addItem } = useCart();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const subscribeMutation = trpc.subscribe.submit.useMutation({
    onSuccess: () => {
      setEmailSubmitted(true);
      toast.success("You're in! We'll keep you updated.");
      setEmail("");
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleEmailCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email });
  };

  return (
    <div>

      {/* ═══════════════════════════════════════════════════
          HERO — Crossfade slideshow: can & glass as hero,
          lifestyle images transitioning behind
          ═══════════════════════════════════════════════════ */}
      <HeroSlideshow heroRef={heroRef} heroScale={heroScale} heroOpacity={heroOpacity} />

      {/* ═══════════════════════════════════════════════════
          WHY KEMZOBO
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-shimmer">
              Why KEMZOBO
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {[
              {
                title: "Bold Hibiscus Flavor",
                text: "Bright, tangy, and deeply refreshing with every sip.",
              },
              {
                title: "Made to Enjoy Cold",
                text: "Best served chilled, over ice, or straight from the can.",
              },
              {
                title: "Simple & Satisfying",
                text: "Crafted with carefully selected ingredients for great taste and everyday enjoyment.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="w-12 h-[2px] bg-hibiscus mx-auto mb-8" />
                <h3 className="font-display text-xl font-bold text-foreground mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MORE THAN A DRINK
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src="/images/heritage-glass.jpg"
                alt="KEMZOBO"
                className="w-full h-[500px] object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-8">
                More Than a Drink
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-8">
                KEMZOBO brings a globally loved traditional drink into a modern, ready-to-drink
                format. It is rooted in culture, designed for convenience, and made to be shared
                in the moments that matter most — from casual hangouts to family gatherings
                and celebrations.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link
                  href="/about"
                  className="btn-primary inline-flex items-center gap-2 text-hibiscus font-semibold text-lg hover:underline"
                >
                  Read Our Story <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SOCIAL PROOF — Testimonials
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Loved at Gatherings
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Cookouts, parties, celebrations — KEMZOBO is always a hit.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "This was the highlight of our party. Everyone kept asking where to buy it.",
                name: "Aisha M.",
                occasion: "Birthday Party",
              },
              {
                quote: "Finally, a drink that tastes like home but comes ready to go. I keep a case in my fridge at all times.",
                name: "David O.",
                occasion: "Everyday Enjoyment",
              },
              {
                quote: "We served KEMZOBO at our cookout and it was gone before the food. Ordering in bulk next time.",
                name: "Tanya R.",
                occasion: "Summer Cookout",
              },
            ].map((t) => (
              <motion.div
                key={t.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className="card-hover bg-[#F7F7F7] rounded-2xl p-8 lg:p-10"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-hibiscus text-hibiscus" />
                  ))}
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.occasion}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED PRODUCTS + Bulk Pricing + Delivery
          ═══════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-24 lg:py-32 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">
                Find Your Flavor
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-muted-foreground text-lg">
                A bold and refreshing ready-to-drink hibiscus beverage. Best served cold.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product) => (
                <motion.div
                  key={product.id}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <ProductCard
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
                </motion.div>
              ))}
            </div>

            {/* Bulk pricing + Delivery strip */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-border">
                <Package className="h-8 w-8 text-hibiscus flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Bulk Pricing Available</p>
                  <p className="text-sm text-muted-foreground">
                    24+ cases ~5% off &nbsp;•&nbsp; 100+ ~9% off &nbsp;•&nbsp; 500+ ~14% off
                  </p>
                </div>
              </div>
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-border">
                <Truck className="h-8 w-8 text-hibiscus flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Free Delivery</p>
                  <p className="text-sm text-muted-foreground">On all orders over $250. Ships nationwide.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mt-12"
            >
              <Link
                href="/products"
                className="btn-primary group inline-flex items-center gap-2 rounded-full border-2 border-foreground text-foreground px-8 py-3.5 font-semibold hover:bg-foreground hover:text-white transition-colors"
              >
                View All Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          LIFESTYLE — Made for Real-Life Moments
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[75vh] min-h-[550px]">
        <img src="/images/lifestyle-friends.jpg" alt="Friends sharing KEMZOBO" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
                Made for Real-Life Moments
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-xl">
                Whether it's brunch with friends, a picnic in the park, a cookout, or a family
                celebration, KEMZOBO belongs at the table. It's the drink you bring when you
                want something bold, different, and memorable.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW TO ENJOY
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-10">
                How to Enjoy
              </motion.h2>

              {[
                "Straight from the can",
                "Poured over ice",
                "Shared at gatherings",
                "Enjoyed anytime you want something refreshing and different",
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-5 mb-6">
                  <span className="w-10 h-10 rounded-full bg-hibiscus/10 text-hibiscus font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground text-lg">{item}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-2xl overflow-hidden"
            >
              <img src="/images/tropical-glass.jpg" alt="KEMZOBO poured over ice" className="w-full h-[500px] object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          BULK / DISTRIBUTOR CTA
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.img
              variants={fadeUp}
              src="/images/logo-dark.png"
              alt="KEMZOBO"
              className="h-14 w-auto mx-auto mb-6"
            />
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Planning an event or stocking your store?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              KEMZOBO is available for bulk orders and distribution. Stores, restaurants,
              events, and distributors — let's talk.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/wholesale"
                className="btn-primary group inline-flex items-center gap-3 rounded-full bg-hibiscus text-white px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-hibiscus-light transition-all"
              >
                Request Bulk Pricing
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          EMAIL CAPTURE — Insider access
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Stay Connected With KEMZOBO
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">
              Be the first to know where KEMZOBO shows up next, new drops,
              and exclusive offers. Join the inner circle.
            </motion.p>

            {emailSubmitted ? (
              <motion.div variants={fadeUp} className="bg-hibiscus/5 rounded-2xl p-8">
                <p className="text-hibiscus font-semibold text-xl">You're in! Welcome to the KEMZOBO circle.</p>
                <p className="text-muted-foreground mt-2">We'll keep you updated on everything.</p>
              </motion.div>
            ) : (
              <motion.form variants={fadeUp} onSubmit={handleEmailCapture} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border border-border bg-[#F7F7F7] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="btn-primary rounded-full bg-hibiscus text-white px-8 py-4 font-semibold hover:bg-hibiscus-light transition-all disabled:opacity-50"
                >
                  Join
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-hibiscus text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-8">
              Ready to Experience KEMZOBO?
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="btn-primary group inline-flex items-center gap-3 rounded-full bg-white text-hibiscus px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                Shop Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/wholesale"
                className="btn-primary inline-flex items-center gap-3 rounded-full border-2 border-white/40 text-white px-10 py-4 font-bold text-lg uppercase tracking-wider hover:border-white transition-colors"
              >
                Order in Bulk
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
