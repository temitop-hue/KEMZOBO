import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Truck, Building2, ArrowRight } from "lucide-react";

// Once KEMZOBO ships into stores, populate this list. Until then the page
// owns the narrative and points buyers/journalists to the wholesale form.
type Retailer = {
  name: string;
  city: string;
  state: string;
  type: "store" | "restaurant" | "event";
  address?: string;
  url?: string;
};

const RETAILERS: Retailer[] = [
  // Empty for now — wholesale rollout in progress.
  // Example shape:
  // { name: "Joe's Market", city: "Brooklyn", state: "NY", type: "store", address: "123 Main St" },
];

export default function FindUs() {
  return (
    <div>
      <PageMeta
        title="Where to Buy"
        description="Find KEMZOBO Original Zobo Drink — order online for nationwide shipping or look up a retailer near you."
        path="/find-us"
      />

      {/* Header */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
            Where to Buy
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Get KEMZOBO in your hands
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Order online for nationwide shipping, or check the list of retailers carrying
            KEMZOBO. New locations roll out every week.
          </p>
        </div>
      </section>

      {/* Three options — Online / Retail / Wholesale */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Truck,
              title: "Order online",
              body: "Ships to all 50 states in 3-7 business days. Bulk discounts at 24+ cases.",
              cta: "Shop now",
              href: "/products",
            },
            {
              icon: MapPin,
              title: "Near you",
              body: RETAILERS.length > 0 ? `${RETAILERS.length} retailers and growing.` : "Retail rollout starting soon. Bookmark this page.",
              cta: "View list",
              href: "#retailers",
            },
            {
              icon: Building2,
              title: "Stock your store",
              body: "Bringing KEMZOBO to your shop, restaurant, or event? We've got bulk pricing.",
              cta: "Wholesale",
              href: "/wholesale",
            },
          ].map((o) => (
            <Link
              key={o.title}
              href={o.href}
              className="group rounded-2xl border border-[#CC2936]/15 bg-white p-6 hover:border-[#CC2936]/40 hover:shadow-md transition-all"
            >
              <div className="rounded-lg bg-[#CC2936]/10 p-2 inline-flex mb-4">
                <o.icon className="h-5 w-5 text-[#CC2936]" />
              </div>
              <h2 className="font-display font-bold text-foreground mb-2">{o.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{o.body}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#CC2936] group-hover:gap-2 transition-all">
                {o.cta} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Retailer list */}
      <section id="retailers" className="bg-hibiscus-bg py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-[#CC2936] text-xs uppercase tracking-[0.3em] font-bold mb-2">
              Retailers carrying KEMZOBO
            </p>
            <h2 className="font-display text-3xl font-bold text-foreground">In stores near you</h2>
          </motion.div>

          {RETAILERS.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#CC2936]/10 p-12 text-center max-w-2xl mx-auto">
              <MapPin className="h-10 w-10 text-[#CC2936]/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Retail rollout in progress.
              </h3>
              <p className="text-muted-foreground mb-6">
                We're talking to stores and restaurants across the country. In the meantime,
                you can order online and have KEMZOBO at your door in days.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
              >
                Shop online <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RETAILERS.map((r) => (
                <div
                  key={`${r.name}-${r.city}`}
                  className="rounded-xl bg-white border border-[#CC2936]/10 p-5"
                >
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#CC2936]">
                    {r.type}
                  </span>
                  <h3 className="font-display font-bold text-foreground mt-1">{r.name}</h3>
                  <p className="text-sm text-muted-foreground">{r.city}, {r.state}</p>
                  {r.address && <p className="text-xs text-muted-foreground mt-1">{r.address}</p>}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-semibold text-[#CC2936] hover:underline mt-2"
                    >
                      Visit →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Are you a retailer? */}
      <section className="bg-[#CC2936] text-white text-center py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Want to carry KEMZOBO?
          </h2>
          <p className="text-white/85 mb-8">
            Stores, restaurants, and event organizers — we'd love to talk. Submit a wholesale
            inquiry and we'll get back to you within one business day.
          </p>
          <Link
            href="/wholesale"
            className="inline-flex items-center gap-2 rounded-full bg-white text-[#CC2936] px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            Wholesale inquiry <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
