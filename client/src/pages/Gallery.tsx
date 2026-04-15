import PageMeta from "@/components/PageMeta";
import { motion, type Variants } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const useCases = [
  {
    title: "Cookouts & BBQs",
    description: "The bold flavor that stands out next to everything on the grill.",
    image: "/images/lifestyle-friends.jpg",
    span: "lg:col-span-2",
  },
  {
    title: "Parties & Celebrations",
    description: "The drink guests keep asking about.",
    image: "/images/bar-glass.jpg",
    span: "lg:col-span-1",
  },
  {
    title: "Everyday Moments",
    description: "Straight from the can or over ice — anytime refreshment.",
    image: "/images/tropical-glass.jpg",
    span: "lg:col-span-1",
  },
  {
    title: "Cultural Gatherings",
    description: "Rooted in tradition, ready for the table.",
    image: "/images/heritage-glass.jpg",
    span: "lg:col-span-2",
  },
];

export default function Gallery() {
  return (
    <div>
      <PageMeta title="Gallery" description="See how KEMZOBO fits into real-life moments — from cookouts to celebrations." path="/gallery" />
      {/* Header */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
              Lifestyle
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
              KEMZOBO in the Wild
            </h1>
            <p className="text-muted-foreground text-lg">
              See how KEMZOBO fits into the moments that matter — from cookouts to
              celebrations and everything in between.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Use-case grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {useCases.map((uc, i) => (
            <motion.div
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className={`${uc.span} relative rounded-2xl overflow-hidden group cursor-pointer h-[350px] lg:h-[450px] ring-1 ring-hibiscus/10 hover:ring-hibiscus/30 transition-all`}
            >
              <img
                src={uc.image}
                alt={uc.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-display text-2xl font-bold text-white mb-2">{uc.title}</h3>
                <p className="text-white/70">{uc.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hero product shot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-2xl overflow-hidden relative h-[500px]"
        >
          <img
            src="/images/hero-can.png"
            alt="KEMZOBO product"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="max-w-xl px-10 lg:px-16">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Bold enough to stand out.
              </h2>
              <p className="text-white/70 text-lg mb-6">
                Refreshing enough to keep coming back.
              </p>
              <Link
                href="/products"
                className="btn-primary group inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-8 py-3.5 font-bold hover:bg-[#E63946] transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
