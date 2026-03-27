import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { motion, type Variants } from "framer-motion";

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

  return (
    <div className="overflow-hidden">

      {/* ════════════════════════════════════════════════════
          ACT 1: THE OPENING — Full-screen hero
          ════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-background via-background to-gold-light/30">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C41E1E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial="hidden" animate="visible" variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-sm font-medium text-hibiscus uppercase tracking-[0.25em] mb-6">
                A West African Legacy
              </motion.p>

              <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1]">
                Every Sip{" "}
                <br className="hidden sm:block" />
                Tells a{" "}
                <span className="italic text-hibiscus">Story</span>
              </motion.h1>

              <motion.div variants={fadeUp} className="mt-8 max-w-lg">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  For generations, Zobo has brought families together across West Africa.
                  Now, <span className="italic font-medium text-foreground">Kem</span> brings
                  that same warmth to you — in a can.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-hibiscus text-white px-8 py-4 font-semibold text-lg hover:bg-hibiscus-light transition-all duration-300 hover:shadow-xl hover:shadow-hibiscus/20"
                >
                  Discover Our Drinks
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-foreground/20 text-foreground px-8 py-4 font-medium text-lg hover:border-hibiscus hover:text-hibiscus transition-colors"
                >
                  Our Story
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="flex justify-center lg:justify-end"
            >
              <img
                src="/images/hero-can.png"
                alt="Kem Original Zobo — can and glass with hibiscus flowers"
                className="max-h-[550px] w-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-hibiscus" />
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════
          ACT 2: THE ORIGIN — Where it all began
          ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-ink text-white relative overflow-hidden">
        {/* Full-bleed heritage image on right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img
            src="/images/heritage-glass.jpg"
            alt="Zobo in traditional setting"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="max-w-xl"
          >
            <motion.p variants={fadeUp} className="text-gold uppercase tracking-[0.3em] text-sm font-medium mb-6">
              Chapter One
            </motion.p>

            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-8">
              Born from a{" "}
              <span className="italic text-gold">Flower</span>,{" "}
              raised by a{" "}
              <span className="italic text-gold">Culture</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed mb-6">
              In the heart of West Africa, hibiscus flowers are more than just petals.
              They are rituals. Celebrations. Family recipes passed down through
              whispered instructions and knowing smiles.
            </motion.p>

            <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed mb-10">
              Zobo — the deep crimson drink made from dried hibiscus — has been the
              centerpiece of gatherings for centuries. At weddings, naming ceremonies,
              and quiet evenings alike, Zobo is always there. Always shared.
              Always <span className="text-gold italic">home</span>.
            </motion.p>

            <motion.div variants={fadeUp}>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-gold font-semibold hover:underline text-lg"
              >
                Read the full story <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile heritage image */}
        <div className="lg:hidden mt-12 px-4">
          <img
            src="/images/heritage-glass.jpg"
            alt="Zobo in traditional setting"
            className="w-full h-[350px] object-cover rounded-2xl"
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ACT 3: THE CRAFT — What makes it different
          ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-hibiscus uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Chapter Two
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-foreground">
              Nature's Recipe.{" "}
              <span className="italic text-hibiscus">Nothing Added.</span>
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                num: "01",
                title: "Hand-Selected Hibiscus",
                text: "We source the finest Hibiscus sabdariffa flowers — rich in color, bold in flavor, bursting with natural antioxidants and Vitamin C.",
                accent: "bg-hibiscus/5 border-hibiscus/20",
              },
              {
                num: "02",
                title: "No Shortcuts",
                text: "Zero artificial flavors. Zero preservatives. Zero added sugars. Just hibiscus, natural spices, and pure water — the way it's been made for generations.",
                accent: "bg-earth-green/5 border-earth-green/20",
              },
              {
                num: "03",
                title: "16 oz of Heritage",
                text: "Every can is 473 ml of carefully crafted refreshment. Tall, cold, and ready — whether you're at a cookout, on a lunch break, or winding down at home.",
                accent: "bg-gold/5 border-gold/20",
              },
            ].map((item) => (
              <motion.div
                key={item.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                className={`rounded-2xl border p-8 lg:p-10 ${item.accent} transition-shadow hover:shadow-lg`}
              >
                <span className="font-display text-5xl font-bold text-foreground/10">{item.num}</span>
                <h3 className="font-display text-xl font-bold text-foreground mt-4 mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          INTERLUDE: Full-bleed tropical image
          ════════════════════════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[500px]">
        <img
          src="/images/tropical-glass.jpg"
          alt="Zobo drink in a tropical, natural setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16"
          >
            <p className="text-white/60 uppercase tracking-[0.3em] text-sm mb-4">The Feeling</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white max-w-2xl leading-tight">
              Refreshment that{" "}
              <span className="italic">reconnects</span> you
            </h2>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ACT 4: THE PEOPLE — Community & lifestyle
          ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="/images/lifestyle-friends.jpg"
                alt="Friends laughing and sharing Kem Zobo"
                className="w-full h-[500px] object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.p variants={fadeUp} className="text-hibiscus uppercase tracking-[0.3em] text-sm font-medium mb-6">
                Chapter Three
              </motion.p>

              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8">
                Made for the{" "}
                <span className="italic text-hibiscus">Moments</span>{" "}
                that matter
              </motion.h2>

              <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-6">
                The best conversations happen over something real.
                Not something from a machine — something that carries meaning.
                Something that sparks the question: <span className="italic font-medium text-foreground">"What is this? It's amazing."</span>
              </motion.p>

              <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-10">
                That's the <span className="italic">Kem</span> moment.
                At cookouts, game nights, brunches, or a quiet Tuesday evening.
                When you share a Zobo, you're sharing a piece of culture.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-full bg-hibiscus text-white px-7 py-3.5 font-semibold hover:bg-hibiscus-light transition-all"
                >
                  Shop Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-hibiscus text-hibiscus px-7 py-3.5 font-semibold hover:bg-hibiscus/5 transition-colors"
                >
                  Wholesale Partners
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ACT 5: THE DRINKS — Featured products
          ════════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-24 bg-gold-light/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} className="text-hibiscus uppercase tracking-[0.3em] text-sm font-medium mb-4">
                The Collection
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold text-foreground">
                Six Flavors.{" "}
                <span className="italic text-hibiscus">One Heritage.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                From the bold original to tropical twists — there's a Kem Zobo for every palate.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="text-center mt-10"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-hibiscus font-semibold text-lg hover:underline"
              >
                View All Flavors <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          INTERLUDE: Bar glass atmosphere
          ════════════════════════════════════════════════════ */}
      <section className="relative h-[50vh] min-h-[350px]">
        <img
          src="/images/bar-glass.jpg"
          alt="Zobo beautifully presented at a bar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 flex items-center justify-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center px-4"
          >
            <p className="font-display text-3xl lg:text-4xl font-bold text-white italic max-w-2xl leading-relaxed">
              "It tastes like home — even if you've never been."
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ACT 6: THE INVITATION — Final CTA
          ════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-hibiscus text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-white/60 uppercase tracking-[0.3em] text-sm mb-6">
              Your Turn
            </motion.p>

            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-8">
              Ready to taste the{" "}
              <span className="italic">heritage</span>?
            </motion.h2>

            <motion.p variants={fadeUp} className="text-white/70 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands discovering the vibrant, healthy refreshment of hibiscus.
              Order for your home, your business, or your next event.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-white text-hibiscus px-10 py-4 font-bold text-lg hover:bg-cream transition-colors hover:shadow-xl"
              >
                Order Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 text-white px-10 py-4 font-semibold text-lg hover:border-white transition-colors"
              >
                Wholesale Inquiry
              </Link>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-8 text-white/40 text-sm">
              Free delivery on orders over $50 &nbsp;•&nbsp; Bulk pricing available
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
