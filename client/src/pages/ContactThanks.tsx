import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShoppingBag, Building2, Home } from "lucide-react";

export default function ContactThanks() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
      <PageMeta
        title="Message received"
        description="Thanks for reaching out to KEMZOBO — we'll get back to you soon."
        path="/contact/thanks"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", bounce: 0.4 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#CC2936]/10 mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-[#CC2936]" strokeWidth={2.5} />
        </motion.div>

        <p className="text-[#CC2936] font-bold text-sm uppercase tracking-[0.3em] mb-3">
          Message Received
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Thanks for reaching out.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-10">
          We've got your message and a member of the KEMZOBO team will get back
          to you shortly — usually within one business day.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            href="/products"
            className="group inline-flex flex-col items-center gap-2 rounded-2xl border border-[#CC2936]/15 bg-white p-5 hover:border-[#CC2936]/40 hover:shadow-md transition-all"
          >
            <ShoppingBag className="h-6 w-6 text-[#CC2936]" />
            <span className="font-semibold text-sm text-foreground">Shop the drink</span>
            <span className="text-xs text-muted-foreground">Order Original Zobo</span>
          </Link>
          <Link
            href="/wholesale"
            className="group inline-flex flex-col items-center gap-2 rounded-2xl border border-[#CC2936]/15 bg-white p-5 hover:border-[#CC2936]/40 hover:shadow-md transition-all"
          >
            <Building2 className="h-6 w-6 text-[#CC2936]" />
            <span className="font-semibold text-sm text-foreground">Wholesale</span>
            <span className="text-xs text-muted-foreground">Stock your store</span>
          </Link>
          <Link
            href="/"
            className="group inline-flex flex-col items-center gap-2 rounded-2xl border border-[#CC2936]/15 bg-white p-5 hover:border-[#CC2936]/40 hover:shadow-md transition-all"
          >
            <Home className="h-6 w-6 text-[#CC2936]" />
            <span className="font-semibold text-sm text-foreground">Back home</span>
            <span className="text-xs text-muted-foreground">Keep browsing</span>
          </Link>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[#CC2936] font-semibold text-sm hover:underline"
        >
          Continue browsing <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}
