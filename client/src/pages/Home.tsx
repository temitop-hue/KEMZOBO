import { Link } from "wouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  const { data: featured } = trpc.products.featured.useQuery();
  const { addItem } = useCart();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="overflow-hidden">

      {/* ════════════════════════════════════════════════════
          HERO — Poppi-style: product center stage, bold type, vibrant
          ════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-[#1a0a08]">
        {/* Parallax background image — can hero fills viewport */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <img
            src="/images/hero-can.png"
            alt="Kem Original Zobo"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient overlays for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a08] via-[#1a0a08]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a08]/60 via-transparent to-transparent" />

        {/* Content pinned to bottom — Poppi style */}
        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 flex flex-col justify-end pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Bold tagline — massive, punchy, overlapping the product */}
              <motion.h1
                variants={fadeUp}
                className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.95] tracking-tight"
              >
                one sip
                <br />
                <span className="italic text-gold">& you're</span>
                <br />
                <span className="text-hibiscus">home.</span>
              </motion.h1>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-hibiscus text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-hibiscus-light transition-all hover:shadow-2xl hover:shadow-hibiscus/30"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-white/50 text-sm uppercase tracking-[0.2em]">
                  16 FL. OZ &nbsp;•&nbsp; Made with Nature's Finest Hibiscus
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="h-6 w-6 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          FLAVOR STRIP — Bold color block like Poppi's product row
          ════════════════════════════════════════════════════ */}
      <section className="bg-hibiscus py-5">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            {[...Array(3)].map((_, i) => (
              <span key={i} className="flex items-center gap-8 text-white/90 font-display text-lg font-bold uppercase tracking-[0.2em]">
                <span>Classic</span>
                <span className="text-gold">✦</span>
                <span>Ginger</span>
                <span className="text-gold">✦</span>
                <span>Pineapple</span>
                <span className="text-gold">✦</span>
                <span>Mango</span>
                <span className="text-gold">✦</span>
                <span>Cinnamon Spice</span>
                <span className="text-gold">✦</span>
                <span>Hibiscus Lemonade</span>
                <span className="text-gold">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PRODUCT CAROUSEL — Poppi-style big product cards
          ════════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-6xl font-bold text-foreground">
                find your <span className="italic text-hibiscus">flavor</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-muted-foreground text-lg">
                Six unique blends. One heritage.
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

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mt-12"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-hibiscus hover:text-white transition-colors"
              >
                View All Flavors
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          LIFESTYLE — Full-bleed friends photo, bold overlaid text
          ════════════════════════════════════════════════════ */}
      <section className="relative h-[80vh] min-h-[600px]">
        <img
          src="/images/lifestyle-friends.jpg"
          alt="Friends sharing Kem Zobo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[0.95]">
                flavor is
                <br />
                <span className="italic text-gold">forever.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 text-white/70 text-lg max-w-md">
                More than a drink. It's a moment. A memory. A culture shared
                between friends, old and new.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-gold font-bold uppercase tracking-wider hover:text-white transition-colors"
                >
                  Our Story <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HERITAGE — Split color block, Poppi-style
          ════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Left: Image */}
        <div className="relative h-[400px] lg:h-auto">
          <img
            src="/images/heritage-glass.jpg"
            alt="Zobo with traditional Nigerian cap and fabric"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Right: Content on dark bg */}
        <div className="bg-ink flex items-center p-10 lg:p-16">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-gold uppercase tracking-[0.3em] text-sm font-bold mb-6">
              Rooted in Tradition
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              born from a{" "}
              <span className="italic text-gold">flower</span>,
              <br />
              raised by a{" "}
              <span className="italic text-gold">culture</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg leading-relaxed mb-8">
              Zobo has been the centerpiece of West African celebrations for centuries.
              At weddings, naming ceremonies, and quiet evenings alike — always shared,
              always home.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full bg-gold text-ink px-7 py-3.5 font-bold uppercase tracking-wider hover:bg-gold-light transition-colors"
              >
                Read Our Story
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          BENEFITS — Bold numbered cards on vibrant bg
          ════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-gold-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-6xl font-bold text-foreground lowercase">
              good for <span className="italic text-hibiscus">you</span>, good for <span className="italic text-earth-green">real</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "100% Natural", desc: "Hand-selected hibiscus flowers. No artificial anything.", bg: "bg-hibiscus", text: "text-white" },
              { num: "02", title: "Packed with Vitamin C", desc: "Antioxidants that support your health — naturally.", bg: "bg-earth-green", text: "text-white" },
              { num: "03", title: "Zero Added Sugar", desc: "Just hibiscus, natural spices, and pure water.", bg: "bg-foreground", text: "text-background" },
            ].map((card) => (
              <motion.div
                key={card.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className={`${card.bg} ${card.text} rounded-2xl p-10 lg:p-12`}
              >
                <span className="font-display text-6xl font-bold opacity-20">{card.num}</span>
                <h3 className="font-display text-2xl font-bold mt-4 mb-3">{card.title}</h3>
                <p className="opacity-80 text-lg leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PULL QUOTE — Bar glass atmosphere
          ════════════════════════════════════════════════════ */}
      <section className="relative h-[60vh] min-h-[400px]">
        <img
          src="/images/bar-glass.jpg"
          alt="Zobo at a bar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center px-4"
          >
            <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white italic leading-tight max-w-3xl">
              "it tastes like home —
              <br />
              even if you've never been."
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TROPICAL — Full-bleed with overlaid text
          ════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[500px]">
        <img
          src="/images/tropical-glass.jpg"
          alt="Zobo in a tropical setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-7xl font-bold text-white leading-[0.95]">
                naturally
                <br />
                <span className="italic text-gold">refreshing.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 text-white/70 text-lg max-w-md">
                Clean, vibrant, and crafted from nature's finest hibiscus flowers.
                16 FL. OZ of pure refreshment.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-white text-hibiscus px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-cream transition-colors"
                >
                  Order Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          WHOLESALE — Color block CTA
          ════════════════════════════════════════════════════ */}
      <section className="bg-ink text-white py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-gold uppercase tracking-[0.3em] text-sm font-bold mb-4">
              For Business
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6">
              carry <span className="italic text-gold">Kem Zobo</span>
              <br />at your store or event
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Bulk pricing available. Stores, restaurants, events, distributors welcome.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/wholesale"
                className="group inline-flex items-center gap-3 rounded-full bg-gold text-ink px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-gold-light transition-colors"
              >
                Wholesale Inquiry
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA — Hibiscus red block
          ════════════════════════════════════════════════════ */}
      <section className="bg-hibiscus text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-5xl lg:text-7xl font-bold leading-[0.95] mb-8">
              ready to taste
              <br />
              the <span className="italic">heritage</span>?
            </motion.h2>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-white text-hibiscus px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-cream transition-colors hover:shadow-xl"
              >
                Order Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-white/40 text-sm uppercase tracking-wider">
              Free delivery on orders over $50 &nbsp;•&nbsp; Bulk pricing available
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
