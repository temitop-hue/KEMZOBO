import { Link } from "wouter";
import { ArrowRight, Mail } from "lucide-react";
import { WHOLESALE_CASE_MESSAGE, MAX_ONLINE_CASES } from "@shared/shipping";

// Shown instead of parcel checkout when the cart has 5+ cases
export default function WholesaleCaseNotice() {
  return (
    <div className="rounded-2xl border border-[#CC2936]/20 bg-hibiscus-bg p-6">
      <p className="font-display text-lg font-bold text-foreground">{WHOLESALE_CASE_MESSAGE}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Online orders ship up to {MAX_ONLINE_CASES} cases. Reduce your cart to {MAX_ONLINE_CASES} or fewer to check out now.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/wholesale"
          className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors"
        >
          Wholesale inquiry <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="mailto:info@kemzobo.com?subject=Wholesale order"
          className="inline-flex items-center gap-2 rounded-full border border-[#CC2936]/30 text-[#CC2936] px-5 py-2.5 text-sm font-semibold hover:bg-white transition-colors"
        >
          <Mail className="h-4 w-4" /> info@kemzobo.com
        </a>
      </div>
    </div>
  );
}
