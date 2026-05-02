import PageMeta from "@/components/PageMeta";
import { Download, Mail, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const ASSETS: Array<{ label: string; href: string; description: string }> = [
  {
    label: "Logo (color, .jpeg)",
    href: "/images/Kem%20Logo.jpg",
    description: "Primary mark on white background",
  },
  {
    label: "Logo (monochrome, .png)",
    href: "/images/Kem%20Logo%20Monochrome.png",
    description: "For dark backgrounds or single-color print",
  },
  {
    label: "Hero photo",
    href: "/images/Hero%20picture.jpeg",
    description: "Group cheers shot — landscape, high-res",
  },
  {
    label: "Product hero",
    href: "/images/Pineapple.jpeg",
    description: "Studio still — can with fruit",
  },
  {
    label: "Lifestyle: pour shot",
    href: "/images/gallery%205.jpeg",
    description: "Pouring KEMZOBO over ice — vertical",
  },
  {
    label: "Lifestyle: gathering",
    href: "/images/gallery%204.jpeg",
    description: "Friends with cans, golden hour",
  },
];

const FACTS: Array<{ label: string; value: string }> = [
  { label: "Brand", value: "KEMZOBO" },
  { label: "Tagline", value: "The Original Zobo Drink" },
  { label: "Category", value: "Ready-to-drink hibiscus beverage" },
  { label: "Format", value: "16 fl oz aluminum can" },
  { label: "Diet", value: "Vegan · Gluten-free · Caffeine-free" },
  { label: "Distribution", value: "Direct-to-consumer (US 50 states)" },
  { label: "Founded", value: "2026" },
  { label: "HQ", value: "United States" },
];

export default function Press() {
  return (
    <div>
      <PageMeta
        title="Press & Media"
        description="Press kit for KEMZOBO Original Zobo Drink — logos, photography, fast facts, and contact."
        path="/press"
      />

      {/* Header */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
            Press & Media
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Press kit
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Everything you need to write about KEMZOBO — logos, photography, brand facts, and
            who to email when you have a question.
          </p>
        </div>
      </section>

      {/* Brand story snippet */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-2xl bg-white border border-[#CC2936]/10 p-8 lg:p-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">In one paragraph</h2>
          <p className="text-foreground/85 leading-relaxed">
            KEMZOBO is the original ready-to-drink Zobo — a bold, refreshing hibiscus beverage
            rooted in West African tradition and crafted for modern American moments. Made
            from real hibiscus with no artificial flavors, KEMZOBO comes in a 16 fl oz can
            and ships nationwide. The brand was founded by Kemi Itayemi to introduce a drink
            she grew up loving to a wider audience — bridging cultural heritage with the
            convenience and quality American consumers expect.
          </p>
        </div>
      </section>

      {/* Fast facts */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Fast facts</h2>
        <div className="rounded-2xl bg-white border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {FACTS.map((f) => (
                <tr key={f.label} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-muted-foreground w-1/3">{f.label}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Downloadable assets */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-4">Logos & photography</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Click any asset to download. Please don't alter, recolor, or distort the logo
          — keep clear space and contrast intact.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSETS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-white border border-[#CC2936]/10 overflow-hidden hover:border-[#CC2936]/40 hover:shadow-md transition-all"
            >
              <div className="aspect-video bg-[#FAFAFA] overflow-hidden">
                <img
                  src={a.href}
                  alt={a.label}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
                <Download className="h-4 w-4 text-[#CC2936] flex-shrink-0 mt-0.5" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-[#CC2936] text-white text-center py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4">
          <Mail className="h-10 w-10 mx-auto mb-4 text-white/70" />
          <h2 className="font-display text-3xl font-bold mb-3">Got a question?</h2>
          <p className="text-white/85 mb-6">
            For press inquiries, founder interviews, samples for review, or anything else —
            we usually reply within one business day.
          </p>
          <a
            href="mailto:info@kemzobo.com?subject=Press inquiry"
            className="inline-flex items-center gap-2 rounded-full bg-white text-[#CC2936] px-8 py-3.5 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
          >
            info@kemzobo.com <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
