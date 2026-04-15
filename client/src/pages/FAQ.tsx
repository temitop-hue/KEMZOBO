import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What does KEMZOBO taste like?",
    a: "KEMZOBO has a bold hibiscus flavor that is bright, refreshing, and satisfying.",
  },
  {
    q: "How should I drink it?",
    a: "KEMZOBO is best enjoyed cold — straight from the can or poured over ice.",
  },
  {
    q: "Where can I buy it?",
    a: "KEMZOBO is available online and ships nationwide. Local availability will continue to expand.",
  },
  {
    q: "Is KEMZOBO a health drink?",
    a: "KEMZOBO is positioned as a refreshing lifestyle beverage rooted in culture and made for everyday social moments.",
  },
  {
    q: "Does it need refrigeration?",
    a: "For best taste, serve KEMZOBO chilled. Follow storage guidance on the packaging.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-hibiscus/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-foreground text-lg pr-4 group-hover:text-hibiscus transition-colors">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180 text-[#CC2936]")} />
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <PageMeta title="FAQ" description="Frequently asked questions about KEMZOBO, THE ORIGINAL ZOBO DRINK." path="/faq" />
      <div className="text-center mb-12">
        <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Help
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
          Frequently Asked Questions
        </h1>
      </div>

      <div>
        {faqs.map((faq) => (
          <FAQItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>
    </div>
  );
}
