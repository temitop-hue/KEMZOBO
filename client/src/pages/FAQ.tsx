import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQ = { q: string; a: string };
type Category = { title: string; faqs: FAQ[] };

const CATEGORIES: Category[] = [
  {
    title: "The Drink",
    faqs: [
      {
        q: "What does KEMZOBO taste like?",
        a: "Bold, bright hibiscus with a tangy finish. Tart up front, slightly floral, never overly sweet — refreshing whether you sip it cold or pour it over ice.",
      },
      {
        q: "What's actually in it?",
        a: "Hibiscus extract, natural flavors, cane sugar, citric acid, and water. No preservatives, no artificial colors, no high-fructose corn syrup.",
      },
      {
        q: "How many calories per can?",
        a: "16 fl oz cans clock in around 90-110 calories — light enough to drink anytime, satisfying enough to feel like a real beverage.",
      },
      {
        q: "Is it caffeinated?",
        a: "No. KEMZOBO is naturally caffeine-free, so it's safe for kids, expecting moms, and late-night sippers.",
      },
      {
        q: "Is it vegan / gluten-free?",
        a: "Yes to both. KEMZOBO is plant-based, vegan, and gluten-free.",
      },
      {
        q: "How should I drink it?",
        a: "Best ice-cold. Straight from the can, over ice, or as a mixer in cocktails (try our Hibiscus Margarita on the recipes page).",
      },
      {
        q: "Does it need refrigeration?",
        a: "Unopened cans are shelf-stable, but KEMZOBO tastes best chilled. Once opened, finish within 24 hours and keep refrigerated.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    faqs: [
      {
        q: "Where do you ship?",
        a: "We currently ship nationwide across the contiguous United States.",
      },
      {
        q: "How much is shipping?",
        a: "$5.99 flat rate on orders under $250. Free shipping on every order over $250.",
      },
      {
        q: "How fast is delivery?",
        a: "Most orders ship within 1-2 business days and arrive within 3-7 business days depending on your location.",
      },
      {
        q: "Will I get tracking?",
        a: "Yes. As soon as your order ships, you'll get an email with the tracking number and carrier.",
      },
      {
        q: "Can you ship to a P.O. Box or military address?",
        a: "Not at this time — we use carriers that require a street address. APO/FPO support is on our roadmap.",
      },
    ],
  },
  {
    title: "Orders & Payment",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "Credit/debit cards (Visa, Mastercard, Amex, Discover) via Stripe, plus Zelle and Venmo for direct payments. Apple Pay and Google Pay work at checkout too.",
      },
      {
        q: "Is checkout secure?",
        a: "Yes. Card details are processed by Stripe — we never see or store your card number. The site runs on HTTPS with TLS encryption end-to-end.",
      },
      {
        q: "Can I use a discount code?",
        a: "Yes — enter it in the discount field on the checkout page. Codes can have minimum order values or expiry dates; if a code doesn't work we'll show you why.",
      },
      {
        q: "Do you offer bulk pricing?",
        a: "Yes. 5% off at 24+ cases, 9% off at 100+, and 14% off at 500+. The discount applies automatically at checkout.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "If your order hasn't shipped yet, email info@kemzobo.com with your order number and we'll help. Once it's shipped we can't cancel, but you can return it (see returns).",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    faqs: [
      {
        q: "What's your return policy?",
        a: "If something arrives damaged or you're not satisfied, email info@kemzobo.com within 14 days of delivery and we'll make it right — full refund or replacement.",
      },
      {
        q: "How long does a refund take?",
        a: "Card refunds typically appear in 5-10 business days depending on your bank. Zelle/Venmo refunds are sent manually within 24 hours.",
      },
    ],
  },
  {
    title: "Wholesale & Partnerships",
    faqs: [
      {
        q: "Do you sell to retailers and restaurants?",
        a: "Yes — submit a wholesale inquiry on the wholesale page and we'll reach out within one business day with pricing, MOQ, and freight options.",
      },
      {
        q: "Do you do events, weddings, or parties?",
        a: "Absolutely. Tell us your event size and date on the contact form and we'll put together a quote. Bulk discounts apply.",
      },
      {
        q: "Are you on Faire / KeHE / UNFI?",
        a: "Not yet — we're early. For now, the fastest path is direct ordering through the wholesale form.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    faqs: [
      {
        q: "Do I need an account to order?",
        a: "No. You can check out as a guest. Creating an account makes reordering and tracking past orders easier.",
      },
      {
        q: "How do you use my data?",
        a: "We use your email and shipping address only to process orders and (if you opt in) send updates. We never sell your data. Full details on the privacy page.",
      },
      {
        q: "How do I unsubscribe from emails?",
        a: "Every marketing email has an unsubscribe link at the bottom. Transactional emails (order confirmations, shipping notices) can't be turned off because they're tied to your purchase.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#CC2936]/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-foreground text-lg pr-4 group-hover:text-[#CC2936] transition-colors">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180 text-[#CC2936]")} />
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  // Generate JSON-LD FAQPage so Google can show rich Q&A snippets in search
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CATEGORIES.flatMap((c) =>
      c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      }))
    ),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <PageMeta
        title="FAQ"
        description="Frequently asked questions about KEMZOBO — ingredients, shipping, returns, wholesale, and account."
        path="/faq"
        jsonLd={faqJsonLd}
      />
      <div className="text-center mb-14">
        <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Help
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="space-y-12">
        {CATEGORIES.map((cat) => (
          <section key={cat.title}>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">{cat.title}</h2>
            <div>
              {cat.faqs.map((f) => (
                <FAQItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-[#CC2936]/5 border border-[#CC2936]/15 p-8 text-center">
        <h3 className="font-display text-xl font-bold text-foreground mb-2">Still have a question?</h3>
        <p className="text-muted-foreground mb-4">Reach out and we'll get back to you within one business day.</p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}
