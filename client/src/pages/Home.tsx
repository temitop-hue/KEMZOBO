import PageMeta from "@/components/PageMeta";
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

function HeroSlideshow({ heroRef, heroScale, heroOpacity }: {
  heroRef: React.RefObject<HTMLElement | null>; heroScale: any; heroOpacity: any;
}) {
  const [current, setCurrent] = useState(0);
  const advance = useCallback(() => setCurrent((p) => (p + 1) % heroSlides.length), []);
  useEffect(() => { const t = setInterval(advance, 5000); return () => clearInterval(t); }, [advance]);
  useEffect(() => { const img = new Image(); img.src = heroSlides[(current + 1) % heroSlides.length].src; }, [current]);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#0f0806]">
      <motion.div style={{ scale: heroScale }} className="absolute inset-0">
        {heroSlides.map((slide, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-[1500ms]" style={{ opacity: i === current ? 1 : 0 }}>
            <img src={slide.src} alt={slide.alt} className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${i === current ? slide.kenBurns : "scale-100"}`} />
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0806] via-[#0f0806]/40 to-[#0f0806]/15 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0806]/70 via-[#0f0806]/25 to-transparent z-[1]" />

      <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 flex flex-col justify-between">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-28">
          <motion.img initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} src="/images/logo-dark.png" alt="KEMZOBO" className="h-14 lg:h-16 w-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 lg:pb-28">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] max-w-3xl">
              Original Zobo.
              <br />
              <span className="text-[#DC2626]">Boldly</span> Refreshing.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-white/60 text-lg lg:text-xl max-w-xl leading-relaxed">
              Made for the moments that bring people together. Bold hibiscus. Timeless tradition. Ready to drink.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary glow-pulse group inline-flex items-center gap-3 rounded-full bg-[#7F1D1D] text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-[#991B1B] transition-all">
                Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
              <Link href="/wholesale" className="btn-primary inline-flex items-center gap-3 rounded-full border-2 border-white/30 text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:border-white hover:bg-white/10 transition-all">
                Order in Bulk
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`transition-all duration-500 rounded-full ${i === current ? "w-8 h-2 bg-[#DC2626]" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`} />
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
    onSuccess: () => { setEmailSubmitted(true); toast.success("You're in!"); setEmail(""); },
    onError: () => toast.error("Something went wrong."),
  });

  return (
    <div>
      <PageMeta title="Home" path="/" />

      {/* ═══════════════════════════════════════════════════
          CHAPTER 1: THE PRODUCT — Hero slideshow
          ═══════════════════════════════════════════════════ */}
      <HeroSlideshow heroRef={heroRef} heroScale={heroScale} heroOpacity={heroOpacity} />

      {/* ═══════════════════════════════════════════════════
          CHAPTER 2: THE STORY — Where it started
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-[#7F1D1D] text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/[0.03]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] font-medium mb-4">
                The Story
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
                It started with a{" "}
                <span className="italic text-[#FCA5A5]">flower</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed mb-6">
                For generations, hibiscus flowers have been at the center of West African
                gatherings. Dried, steeped, sweetened, and shared — Zobo is more than a
                recipe. It's a ritual passed down through families.
              </motion.p>
              <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed mb-8">
                KEMZOBO takes that ritual and puts it in your hand — bold, refreshing,
                and ready to drink. No prep, no wait. Just crack open a can and taste
                something real.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link href="/about" className="btn-primary inline-flex items-center gap-2 text-[#FCA5A5] font-semibold text-lg hover:text-white transition-colors">
                  Read the full story <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              <img src="/images/heritage-glass.jpg" alt="Zobo heritage" loading="lazy" className="w-full h-[500px] object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 3: THE PRODUCT — What's in the can
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-[#B91C1C] text-sm uppercase tracking-[0.3em] font-bold mb-4">The Drink</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-shimmer">
              What Makes It Different
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Bold Hibiscus Flavor", text: "Bright, tangy, and deeply refreshing. Not subtle — unapologetically bold. The kind of flavor that makes people stop and ask, \"What is this?\"", bg: "bg-[#7F1D1D]", text_col: "text-white" },
              { num: "02", title: "Made to Enjoy Cold", text: "Crack it open. Pour it over ice. Share it at the cookout. KEMZOBO is designed to be enjoyed cold — wherever the moment takes you.", bg: "bg-hibiscus-bg", text_col: "text-foreground" },
              { num: "03", title: "Simple & Satisfying", text: "Carefully selected ingredients. No artificial anything. Just hibiscus, natural spices, and pure water — 16 FL. OZ of refreshment in every can.", bg: "bg-[#7F1D1D]", text_col: "text-white" },
            ].map((card) => (
              <motion.div key={card.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className={`${card.bg} ${card.text_col} rounded-2xl p-10 lg:p-12 card-hover`}
              >
                <span className="font-display text-6xl font-bold opacity-20">{card.num}</span>
                <h3 className="font-display text-2xl font-bold mt-4 mb-4">{card.title}</h3>
                <p className="opacity-80 text-lg leading-relaxed">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 4: THE EXPERIENCE — Pouring the drink
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[80vh] min-h-[600px]">
        <img src="/images/tropical-glass.jpg" alt="KEMZOBO poured over ice" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0806] via-[#0f0806]/30 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-4">The Experience</motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-7xl font-bold text-white leading-[1] max-w-2xl">
                Pour it.
                <br />
                <span className="text-[#FCA5A5]">Taste it.</span>
                <br />
                Share it.
              </motion.h2>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 5: THE WAYS — How to enjoy
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-hibiscus-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-[#B91C1C] text-sm uppercase tracking-[0.3em] font-bold mb-4">Your Way</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">
              Four Ways to Enjoy
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: "/images/enjoy-can.jpg", title: "Straight from the Can", text: "Cold. Bold. Grab and go." },
              { img: "/images/enjoy-ice.jpg", title: "Poured Over Ice", text: "The classic serve. Watch that deep red pour." },
              { img: "/images/enjoy-gathering.jpg", title: "Shared at Gatherings", text: "Cookouts, parties, celebrations. KEMZOBO belongs." },
              { img: "/images/enjoy-anytime.jpg", title: "Anytime Refreshment", text: "Tuesday afternoon. Sunday brunch. Any moment." },
            ].map((item) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden card-hover border border-[#B91C1C]/10"
              >
                <div className="h-48 overflow-hidden">
                  <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 6: THE PEOPLE — Social proof
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-[#B91C1C] text-sm uppercase tracking-[0.3em] font-bold mb-4">The People</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">
              What They're Saying
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "This was the highlight of our party. Everyone kept asking where to buy it.", name: "Aisha M.", occasion: "Birthday Party" },
              { quote: "Finally, a drink that tastes like home but comes ready to go. I keep a case in my fridge at all times.", name: "David O.", occasion: "Everyday Enjoyment" },
              { quote: "We served KEMZOBO at our cookout and it was gone before the food. Ordering in bulk next time.", name: "Tanya R.", occasion: "Summer Cookout" },
            ].map((t) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="card-hover bg-hibiscus-bg rounded-2xl p-8 lg:p-10 border border-[#B91C1C]/10"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#B91C1C] text-[#B91C1C]" />)}
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-6 italic">"{t.quote}"</p>
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
          CHAPTER 7: THE MOMENT — Lifestyle full-bleed
          ═══════════════════════════════════════════════════ */}
      <section className="relative h-[75vh] min-h-[550px]">
        <img src="/images/lifestyle-friends.jpg" alt="Friends sharing KEMZOBO" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0806]/80 via-[#0f0806]/20 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-4">The Moment</motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-6xl font-bold text-white max-w-2xl leading-tight">
                It belongs wherever people{" "}
                <span className="italic text-[#FCA5A5]">come together</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-white/60 text-lg max-w-xl">
                Cookouts. Brunches. Parties. Family dinners. The drink you bring when you
                want something bold, different, and memorable.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 8: THE COLLECTION — Products
          ═══════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-28 lg:py-36 bg-hibiscus-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
              <motion.p variants={fadeUp} className="text-[#B91C1C] text-sm uppercase tracking-[0.3em] font-bold mb-4">The Collection</motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">Find Your Flavor</motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-muted-foreground text-lg">Six bold flavors. One heritage. Best served cold.</motion.p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((product) => (
                <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <ProductCard product={product} onAddToCart={() => addItem({ productId: product.id, variantId: 0, productName: product.name, variantName: "Default", price: 0, imageUrl: product.imageUrl ?? undefined })} />
                </motion.div>
              ))}
            </div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-[#B91C1C]/10">
                <Package className="h-8 w-8 text-[#B91C1C] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Bulk Pricing</p>
                  <p className="text-sm text-muted-foreground">24+ cases ~5% off • 100+ ~9% off • 500+ ~14% off</p>
                </div>
              </div>
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-[#B91C1C]/10">
                <Truck className="h-8 w-8 text-[#B91C1C] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Free Delivery</p>
                  <p className="text-sm text-muted-foreground">On all orders over $250. Ships nationwide.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mt-12">
              <Link href="/products" className="btn-primary group inline-flex items-center gap-2 rounded-full border-2 border-foreground text-foreground px-8 py-3.5 font-semibold hover:bg-foreground hover:text-white transition-colors">
                View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          CHAPTER 9: THE BUSINESS — Bulk/wholesale
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-32 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.img variants={fadeUp} src="/images/logo-dark.png" alt="KEMZOBO" loading="lazy" className="h-14 w-auto mx-auto mb-6" />
            <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-4">For Business</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Stock your store. Serve at your event.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              KEMZOBO is available for bulk orders and distribution. Stores, restaurants, events, and distributors — let's build something together.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/wholesale" className="btn-primary group inline-flex items-center gap-3 rounded-full bg-[#7F1D1D] text-white px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-[#991B1B] transition-all">
                Request Bulk Pricing <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 10: THE CIRCLE — Email capture
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-32">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-[#B91C1C] text-sm uppercase tracking-[0.3em] font-bold mb-4">Join the Circle</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-bold mb-4">Stay Connected</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">
              Be the first to know where KEMZOBO shows up next, new drops, and exclusive offers.
            </motion.p>

            {emailSubmitted ? (
              <motion.div variants={fadeUp} className="bg-[#B91C1C]/5 rounded-2xl p-8 border border-[#B91C1C]/10">
                <p className="text-[#B91C1C] font-semibold text-xl">You're in! Welcome to the KEMZOBO circle.</p>
                <p className="text-muted-foreground mt-2">We'll keep you updated on everything.</p>
              </motion.div>
            ) : (
              <motion.form variants={fadeUp} onSubmit={(e) => { e.preventDefault(); if (email) subscribeMutation.mutate({ email }); }} className="flex gap-3 max-w-md mx-auto">
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border border-[#B91C1C]/20 bg-hibiscus-bg px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:bg-white transition-colors" />
                <button type="submit" disabled={subscribeMutation.isPending}
                  className="btn-primary rounded-full bg-[#7F1D1D] text-white px-8 py-4 font-semibold hover:bg-[#991B1B] transition-all disabled:opacity-50">
                  Join
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINALE: THE INVITATION
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-[#7F1D1D] text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/[0.03]" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-6">Your Turn</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-8">
              Ready to taste the{" "}
              <span className="italic text-[#FCA5A5]">heritage</span>?
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="btn-primary group inline-flex items-center gap-3 rounded-full bg-white text-[#7F1D1D] px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-100 transition-colors">
                Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/wholesale" className="btn-primary inline-flex items-center gap-3 rounded-full border-2 border-white/30 text-white px-10 py-4 font-bold text-lg uppercase tracking-wider hover:border-white transition-colors">
                Order in Bulk
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
