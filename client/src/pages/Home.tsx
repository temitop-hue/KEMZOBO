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

// ─── Lifestyle Hero ──────────────────────────────────────
// Lifestyle-first: video of people gathering → fallback to friends image
// Product appears as a supporting element, not the hero
const lifestyleImages = [
  "/images/lifestyle-friends.jpg",
  "/images/heritage-glass.jpg",
  "/images/bar-glass.jpg",
  "/images/tropical-glass.jpg",
];

function LifestyleHero({ heroRef, heroScale, heroOpacity }: {
  heroRef: React.RefObject<HTMLElement | null>; heroScale: any; heroOpacity: any;
}) {
  const [bgIndex, setBgIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);

  // Cycle background images after video ends
  useEffect(() => {
    if (videoPlaying) return;
    const t = setInterval(() => setBgIndex((p) => (p + 1) % lifestyleImages.length), 6000);
    return () => clearInterval(t);
  }, [videoPlaying]);

  // Preload images
  useEffect(() => {
    lifestyleImages.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-[#0f0806]">

      {/* Layer 1: Ambient lifestyle video */}
      <motion.div style={{ scale: heroScale }} className="absolute inset-0">
        <video
          autoPlay loop muted playsInline
          poster="/images/lifestyle-friends.jpg"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoReady ? "opacity-100" : "opacity-0"}`}
          onCanPlay={() => setVideoReady(true)}
          onEnded={() => setVideoPlaying(false)}
        >
          <source src="/videos/kemzobo-final.mp4" type="video/mp4" />
        </video>

        {/* Fallback: crossfading lifestyle images */}
        {lifestyleImages.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: !videoReady && i === bgIndex ? 1 : videoReady ? 0 : i === bgIndex ? 1 : 0 }}
          >
            <img
              src={src}
              alt="KEMZOBO lifestyle"
              className="w-full h-full object-cover scale-105"
            />
          </div>
        ))}
      </motion.div>

      {/* Layer 2: Strong overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-black/25 z-[1]" />

      {/* Layer 3: Content */}
      <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 flex flex-col justify-between">

        {/* Top: Logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 lg:pt-28">
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            src="/images/New_Logo.jpeg"
            alt="KEMZOBO"
            className="h-14 lg:h-16 w-auto"
          />
        </div>

        {/* Center/Bottom: Story-driven headline */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">

            {/* Left: Emotional copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-8">
              <motion.p variants={fadeUp} className="text-white/70 text-sm uppercase tracking-[0.3em] mb-5 font-medium" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                KEMZOBO, The Original Zobo Drink
              </motion.p>

              <motion.h1 variants={fadeUp} className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3)" }}>
                The drink that
                <br />
                brings people{" "}
                <span className="italic text-[#EF4444]">together.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-white/70 text-lg lg:text-xl max-w-lg leading-relaxed" style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}>
                Bold hibiscus. Timeless tradition. Ready to drink.
                Made for cookouts, celebrations, and the everyday
                moments where good drinks belong.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/products"
                  className="btn-primary glow-pulse group inline-flex items-center gap-3 rounded-full bg-[#CC2936] text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-[#E63946] transition-all"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <Link
                  href="/wholesale"
                  className="btn-primary inline-flex items-center gap-3 rounded-full border-2 border-white/25 text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:border-white/60 hover:bg-white/5 transition-all"
                >
                  Order in Bulk
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Floating product card — the product is present but secondary */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="lg:col-span-4 hidden lg:flex justify-end"
            >
              <div className="relative">
                <div className="bg-white/[0.08] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/30">
                  <img
                    src="/images/hero-can.png"
                    alt="KEMZOBO 16 FL. OZ"
                    className="h-48 w-auto object-contain mx-auto drop-shadow-2xl"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-white font-display font-bold text-sm">KEMZOBO</p>
                    <p className="text-white/40 text-xs uppercase tracking-wider mt-0.5">16 FL. OZ &bull; Ready to Drink</p>
                  </div>
                  <Link
                    href="/products"
                    className="mt-4 block text-center rounded-full bg-white/10 text-white text-xs font-semibold py-2.5 px-4 hover:bg-white/20 transition-colors uppercase tracking-wider"
                  >
                    View Collection
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="h-5 w-5 text-white/20" />
          </motion.div>
        </motion.div>
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
      <LifestyleHero heroRef={heroRef} heroScale={heroScale} heroOpacity={heroOpacity} />

      {/* ═══════════════════════════════════════════════════
          CHAPTER 2: THE STORY — Where it started
          ═══════════════════════════════════════════════════ */}
      <section className="py-28 lg:py-36 bg-[#CC2936] text-white relative overflow-hidden">
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
                <span className="italic text-[#E63946]">flower</span>
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
                <Link href="/about" className="btn-primary inline-flex items-center gap-2 text-[#E63946] font-semibold text-lg hover:text-white transition-colors">
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
            <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">The Drink</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-shimmer">
              What Makes It Different
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Bold Hibiscus Flavor", text: "Bright, tangy, and deeply refreshing. Not subtle — unapologetically bold. The kind of flavor that makes people stop and ask, \"What is this?\"", bg: "bg-[#CC2936]", text_col: "text-white" },
              { num: "02", title: "Made to Enjoy Cold", text: "Crack it open. Pour it over ice. Share it at the cookout. KEMZOBO is designed to be enjoyed cold — wherever the moment takes you.", bg: "bg-hibiscus-bg", text_col: "text-foreground" },
              { num: "03", title: "Simple & Satisfying", text: "Carefully selected ingredients. No artificial anything. Just hibiscus, natural spices, and pure water — 16 FL. OZ of refreshment in every can.", bg: "bg-[#CC2936]", text_col: "text-white" },
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
                <span className="text-[#E63946]">Taste it.</span>
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
            <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">Your Way</motion.p>
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
                className="bg-white rounded-2xl overflow-hidden card-hover border border-[#CC2936]/10"
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
            <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">The People</motion.p>
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
                className="card-hover bg-hibiscus-bg rounded-2xl p-8 lg:p-10 border border-[#CC2936]/10"
              >
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#CC2936] text-[#CC2936]" />)}
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
                <span className="italic text-[#E63946]">come together</span>
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
              <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">The Collection</motion.p>
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
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-[#CC2936]/10">
                <Package className="h-8 w-8 text-[#CC2936] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Bulk Pricing</p>
                  <p className="text-sm text-muted-foreground">24+ cases ~5% off • 100+ ~9% off • 500+ ~14% off</p>
                </div>
              </div>
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-[#CC2936]/10">
                <Truck className="h-8 w-8 text-[#CC2936] flex-shrink-0" />
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
            <motion.img variants={fadeUp} src="/images/New_Logo.jpeg" alt="KEMZOBO" loading="lazy" className="h-14 w-auto mx-auto mb-6" />
            <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-4">For Business</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Stock your store. Serve at your event.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              KEMZOBO is available for bulk orders and distribution. Stores, restaurants, events, and distributors — let's build something together.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/wholesale" className="btn-primary group inline-flex items-center gap-3 rounded-full bg-[#CC2936] text-white px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-[#E63946] transition-all">
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
            <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">Join the Circle</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-bold mb-4">Stay Connected</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">
              Be the first to know where KEMZOBO shows up next, new drops, and exclusive offers.
            </motion.p>

            {emailSubmitted ? (
              <motion.div variants={fadeUp} className="bg-[#CC2936]/5 rounded-2xl p-8 border border-[#CC2936]/10">
                <p className="text-[#CC2936] font-semibold text-xl">You're in! Welcome to the KEMZOBO circle.</p>
                <p className="text-muted-foreground mt-2">We'll keep you updated on everything.</p>
              </motion.div>
            ) : (
              <motion.form variants={fadeUp} onSubmit={(e) => { e.preventDefault(); if (email) subscribeMutation.mutate({ email }); }} className="flex gap-3 max-w-md mx-auto">
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border border-[#CC2936]/20 bg-hibiscus-bg px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936] focus:bg-white transition-colors" />
                <button type="submit" disabled={subscribeMutation.isPending}
                  className="btn-primary rounded-full bg-[#CC2936] text-white px-8 py-4 font-semibold hover:bg-[#E63946] transition-all disabled:opacity-50">
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
      <section className="py-28 lg:py-36 bg-[#CC2936] text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/[0.03]" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-white/40 text-sm uppercase tracking-[0.3em] mb-6">Your Turn</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-8">
              Ready to taste the{" "}
              <span className="italic text-[#E63946]">heritage</span>?
            </motion.h2>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="btn-primary group inline-flex items-center gap-3 rounded-full bg-white text-[#CC2936] px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-100 transition-colors">
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
