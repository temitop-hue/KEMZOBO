import { Link } from "wouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

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
          HERO
          ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-[#1a0a08]">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <video
            autoPlay loop muted playsInline
            poster="/images/hero-can.png"
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
            <source src="/videos/hero.webm" type="video/webm" />
          </video>
          <img
            src="/images/hero-can.png"
            alt="KEMZOBO"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-10 flex flex-col justify-end pb-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-white/60 text-sm uppercase tracking-[0.3em] mb-4">
                KEMZOBO, The Original Zobo Drink
              </motion.p>

              <motion.h1 variants={fadeUp} className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-[1]">
                Original Zobo.
                <br />
                <span className="text-hibiscus">Boldly Refreshing.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-white/70 text-lg max-w-lg">
                Inspired by traditional zobo, KEMZOBO is a refreshing ready-to-drink
                hibiscus beverage crafted for modern sipping.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 rounded-full bg-hibiscus text-white px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-hibiscus-light transition-all"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.p variants={fadeUp} className="mt-6 text-white/40 text-sm tracking-wider">
                BOLD hibiscus. Timeless tradition. Ready to drink.
              </motion.p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="h-6 w-6 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WHY KEMZOBO
          ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold">
              Why KEMZOBO
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
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
                <div className="w-12 h-[2px] bg-hibiscus mx-auto mb-6" />
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MORE THAN A DRINK — Brand section
          ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-xl overflow-hidden"
            >
              <img
                src="/images/heritage-glass.jpg"
                alt="KEMZOBO with traditional setting"
                className="w-full h-[450px] object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-6">
                More Than a Drink
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-6">
                KEMZOBO brings a globally loved traditional drink into a modern, ready-to-drink
                format. It is rooted in culture, designed for convenience, and made to be shared
                in the moments that matter most — from casual hangouts to family gatherings
                and celebrations.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-hibiscus font-semibold hover:underline"
                >
                  Read Our Story <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURED PRODUCTS
          ═══════════════════════════════════════════════════ */}
      {featured && featured.length > 0 && (
        <section className="py-20 lg:py-28">
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

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mt-12"
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-foreground text-foreground px-8 py-3.5 font-semibold hover:bg-foreground hover:text-white transition-colors"
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
        <img
          src="/images/lifestyle-friends.jpg"
          alt="Friends sharing KEMZOBO"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 lg:pb-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={stagger}
            >
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
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-8">
                How to Enjoy
              </motion.h2>

              {[
                "Straight from the can",
                "Poured over ice",
                "Shared at gatherings",
                "Enjoyed anytime you want something refreshing and different",
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 mb-5">
                  <span className="w-8 h-8 rounded-full bg-hibiscus/10 text-hibiscus font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-muted-foreground text-lg">{item}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-xl overflow-hidden"
            >
              <img
                src="/images/tropical-glass.jpg"
                alt="KEMZOBO poured over ice"
                className="w-full h-[450px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          EMAIL CAPTURE
          ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-[#F7F7F7]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Stay Connected With KEMZOBO
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
              Be the first to know about new drops, special offers, and where KEMZOBO
              is showing up next.
            </motion.p>

            {emailSubmitted ? (
              <motion.p variants={fadeUp} className="text-hibiscus font-semibold text-lg">
                You're in! We'll keep you updated.
              </motion.p>
            ) : (
              <motion.form variants={fadeUp} onSubmit={handleEmailCapture} className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus"
                />
                <button
                  type="submit"
                  className="rounded-full bg-hibiscus text-white px-6 py-3 font-semibold text-sm hover:bg-hibiscus-light transition-colors"
                >
                  Sign Up
                </button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-hibiscus text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Ready to Experience KEMZOBO?
            </motion.h2>
            <motion.div variants={fadeUp}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-white text-hibiscus px-10 py-4 font-bold text-lg uppercase tracking-wider hover:bg-gray-100 transition-colors"
              >
                Shop Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
