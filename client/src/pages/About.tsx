import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <img
              src="/images/logo-navbar.png"
              alt="KEMZOBO"
              className="h-16 w-auto mx-auto mb-8"
            />
            <p className="text-hibiscus text-sm uppercase tracking-[0.3em] font-medium mb-4">
              Our Story
            </p>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-8">
              Bold Flavor. Cultural Roots. Modern Life.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              KEMZOBO was born from a desire to bring something rooted in culture into a format
              that feels natural for modern life. Inspired by traditional zobo — a hibiscus drink
              enjoyed across generations and known in different places by names like sorrel and
              bissap — KEMZOBO transforms a familiar, globally loved experience into a convenient
              ready-to-drink beverage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Image break */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="rounded-xl overflow-hidden"
        >
          <img
            src="/images/heritage-glass.jpg"
            alt="KEMZOBO heritage"
            className="w-full h-[400px] lg:h-[500px] object-cover"
          />
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-20 lg:py-28 bg-[#F7F7F7]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Our mission is to bring the bold, refreshing taste of zobo into everyday moments —
              offering a flavorful, ready-to-drink beverage that fits effortlessly wherever people
              gather, celebrate, and connect.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Today, the brand stands for bold flavor, cultural authenticity, and the simple joy of
              sharing something different at the moments that bring people together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lifestyle positioning */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
                It Belongs at the Table
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                KEMZOBO isn't trying to replace the moment — it's here to expand it. At cookouts,
                parties, family gatherings, brunches, and celebrations, people reach for familiar
                drinks. KEMZOBO belongs right there — chilled, poured, and enjoyed alongside
                everything else on the table.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                With its bold hibiscus flavor and refreshing finish, KEMZOBO brings something
                different to the mix without asking anyone to change how they celebrate.
              </p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="rounded-xl overflow-hidden"
            >
              <img
                src="/images/lifestyle-friends.jpg"
                alt="Friends sharing KEMZOBO"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-hibiscus text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold mb-6">
            Ready to Experience KEMZOBO?
          </h2>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-white text-hibiscus px-8 py-4 font-bold hover:bg-gray-100 transition-colors"
          >
            Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
