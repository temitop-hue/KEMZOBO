import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { ArrowRight, Star, Truck, Package, Sparkles, Calendar, Flower2, Leaf, ShieldCheck, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, type: "spring", bounce: 0.3 } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── Lifestyle Hero ──────────────────────────────────────
// Premium split layout: 40% dark text panel | 60% lifestyle image
// + full-width trust-badge strip at the bottom
const trustBadges = [
  { icon: Flower2, label: "Made with Real Hibiscus", color: "#E63946" },
  { icon: Leaf, label: "No Artificial Flavors", color: "#22C55E" },
  { icon: ShieldCheck, label: "Refreshing & Bold", color: "#E63946" },
  { icon: Users, label: "Made for Every Moment", color: "#E63946" },
];

function LifestyleHero({ heroRef, heroScale, heroOpacity }: {
  heroRef: React.RefObject<HTMLElement | null>; heroScale: any; heroOpacity: any;
}) {
  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-black flex flex-col">

      {/* Layer 1: Full-bleed lifestyle image — refined cinematic treatment */}
      <motion.div
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1.01, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img
            src="/images/hero%20shot.jpeg"
            alt="Friends raising KEMZOBO cans together"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-[60%_42%] lg:object-[60%_center]"
            style={{
              filter: "saturate(1.08) contrast(1.06)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Layer 2: Subtle vignette (edges slightly darker, preserves skin tones) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, transparent 45%, rgba(0,0,0,0.28) 100%)",
        }}
      />

      {/* Layer 3: Cinematic dark gradient — tokenized so future edits can't flatten it */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none hidden lg:block"
        style={{ background: "var(--hero-grad-h)" }}
      />
      {/* Mobile: vertical gradient */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none lg:hidden"
        style={{ background: "var(--hero-grad-v)" }}
      />

      {/* Layer 3b: Fine-grain film texture — overlay blend lets it sit in shadows, fade in highlights */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "240px 240px",
        }}
      />

      {/* Layer 4: Content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-20 xl:px-28 py-24 lg:py-32"
      >
        {/* Subtle "lit" highlight behind text — barely perceptible, just feels better */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.035), transparent 60%)",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative max-w-[560px] w-full lg:ml-2"
        >
          <motion.h1
            variants={fadeUp}
            className="hero-title font-display font-black text-[2.6rem] sm:text-[3.75rem] lg:text-[5.25rem] xl:text-[6.25rem] leading-[1.02] tracking-[-0.01em]"
            style={{
              textShadow:
                "0 10px 40px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.85)",
            }}
          >
            <span style={{ color: "#ffffff" }}>Bold Hibiscus.</span>
            <br />
            <span
              style={{
                color: "rgba(200,29,37,0.95)",
                fontSize: "0.93em",
                display: "inline-block",
                lineHeight: "1.05",
              }}
            >
              Timeless Tradition.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 sm:mt-8 lg:mt-10 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md"
            style={{
              color: "rgba(255,255,255,0.85)",
              fontWeight: 300,
              textShadow: "0 2px 14px rgba(0,0,0,0.55)",
            }}
          >
            The Original Zobo Drink&mdash;made for every gathering.
          </motion.p>

          <motion.div variants={fadeUp} className="hero-ctas mt-10 lg:mt-14 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full text-white px-9 py-4 font-bold text-base uppercase tracking-[0.15em] hover:scale-[1.04] transition-all duration-300 ease-out will-change-transform"
              style={{
                background:
                  "linear-gradient(180deg, #D62F3D 0%, #B81F2A 100%)",
                boxShadow:
                  "0 10px 30px rgba(200,29,37,0.25), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.25)",
              }}
            >
              Shop Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <Link
              href="/wholesale"
              className="group inline-flex items-center gap-3 rounded-full border text-white px-9 py-4 font-bold text-base uppercase tracking-[0.15em] hover:bg-white/10 hover:backdrop-blur-md hover:border-white hover:scale-[1.04] transition-all duration-300 ease-out will-change-transform"
              style={{ borderColor: "rgba(255,255,255,0.8)" }}
            >
              Order in Bulk
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Layer 5: Trust-badge strip — full width across hero base */}
      <div className="relative z-10 bg-black/80 backdrop-blur-md border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-10 items-center">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <badge.icon className="h-6 w-6 flex-shrink-0" style={{ color: badge.color }} />
                <span
                  className="text-sm lg:text-base font-medium"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
          START HERE — Quick purchase entry points
          ═══════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 border-b border-[#CC2936]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-10"
          >
            <motion.p
              variants={fadeUp}
              className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-3"
            >
              Start Here
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-3xl lg:text-4xl font-bold text-foreground"
            >
              Pick your KEMZOBO moment
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-3 text-sm font-medium text-[#CC2936]/80 uppercase tracking-wider"
            >
              Now shipping nationwide &middot; Limited first batch available
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              {
                icon: Package,
                title: "Buy a Case",
                text: "Stock up on a 12-pack. Best value, ready to share.",
                cta: "Shop Cases",
                href: "/products",
              },
              {
                icon: Sparkles,
                title: "Try KEMZOBO",
                text: "First time? Start with a single can or 6-pack.",
                cta: "Try It",
                href: "/products",
              },
              {
                icon: Calendar,
                title: "Order for Events",
                text: "Cookouts, weddings, parties — bulk delivery available.",
                cta: "Plan an Event",
                href: "/wholesale",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="group relative rounded-2xl border border-[#CC2936]/10 bg-white p-6 lg:p-7 card-hover hover:border-[#CC2936]/30 transition-all"
              >
                <item.icon className="h-9 w-9 text-[#CC2936] mb-4" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {item.text}
                </p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white text-sm font-bold uppercase tracking-wider px-5 py-2.5 hover:bg-[#E63946] transition-colors"
                >
                  {item.cta}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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

      {/* Mid-page CTA strip */}
      <section className="bg-[#CC2936] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-display text-2xl lg:text-3xl font-bold text-white">
              Ready to taste it?
            </p>
            <p className="text-white/80 text-sm mt-1">
              Now shipping nationwide &middot; Limited first batch available
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white text-[#CC2936] px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
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

      {/* Mid-page CTA strip — sales nudge before products */}
      <section className="bg-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-display text-2xl lg:text-3xl font-bold text-white">
              Don't just take their word for it.
            </p>
            <p className="text-white/70 text-sm mt-1">
              Try the Original Zobo today.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors whitespace-nowrap"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CHAPTER 8: THE COLLECTION — Products
          ═══════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-28 lg:py-36 bg-hibiscus-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
              <motion.p variants={fadeUp} className="text-[#CC2936] text-sm uppercase tracking-[0.3em] font-bold mb-4">Available Now</motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">Start with the Original</motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-muted-foreground text-lg">
                Bold hibiscus. 12-pack cases. Single cans available.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-4 flex flex-wrap justify-center items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CC2936] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                  <Truck className="h-3 w-3" /> Now Shipping Nationwide
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#CC2936]/20 text-[#CC2936] text-xs font-bold uppercase tracking-wider px-3 py-1.5">
                  Limited First Batch
                </span>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto">
              {featured.map((product) => (
                <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <ProductCard
                    product={product}
                    onAddToCart={(v) =>
                      addItem({
                        productId: product.id,
                        variantId: v.id,
                        productName: product.name,
                        variantName: v.name,
                        price: v.price,
                        imageUrl: product.imageUrl ?? undefined,
                      })
                    }
                  />
                </motion.div>
              ))}
            </div>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mt-8 text-sm font-medium text-muted-foreground italic"
            >
              More flavors coming soon.
            </motion.p>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-hover flex items-center gap-4 bg-white rounded-xl p-5 border border-[#CC2936]/10">
                <Package className="h-8 w-8 text-[#CC2936] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Bulk Pricing</p>
                  <p className="text-sm text-muted-foreground">24+ cases ~5% off &bull; 100+ ~9% off &bull; 500+ ~14% off</p>
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

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mt-12 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="btn-primary group inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/wholesale"
                className="btn-primary inline-flex items-center gap-2 rounded-full border-2 border-foreground text-foreground px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-foreground hover:text-white transition-colors"
              >
                Order in Bulk
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
