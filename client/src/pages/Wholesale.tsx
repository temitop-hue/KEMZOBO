import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { WHOLESALE_TIERS, formatPrice } from "@shared/const";

export default function Wholesale() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    businessType: "other" as const,
    estimatedVolume: "",
    message: "",
  });

  const submitMutation = trpc.wholesale.submit.useMutation({
    onSuccess: () => {
      setLocation("/contact/thanks");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageMeta title="Wholesale" description="Carry KEMZOBO at your store, restaurant, or event. Wholesale pricing from $30 per case." path="/wholesale" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Wholesale Inquiry
      </h1>
      <p className="text-muted-foreground mb-4">
        Carry KEMZOBO at your store, restaurant, or event.
      </p>

      {/* Pricing tiers: Nov 2026 wholesale price sheet */}
      <div className="rounded-xl border border-border bg-card p-6 mb-10">
        <h3 className="font-display font-semibold text-lg">Wholesale &amp; Volume Pricing</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Per 12-can case. Volume pricing is based on the number of cases in a single order.
        </p>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936] text-white text-left">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Order type</th>
                <th className="px-4 py-2.5 font-semibold">Minimum</th>
                <th className="px-4 py-2.5 font-semibold text-right">Price / case</th>
              </tr>
            </thead>
            <tbody>
              {WHOLESALE_TIERS.map((t, i) => (
                <tr key={t.minCases} className={i % 2 ? "bg-hibiscus-bg" : "bg-white"}>
                  <td className="px-4 py-3 font-medium text-foreground">{t.orderType}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.maxCases ? `${t.minCases}–${t.maxCases} cases` : `${t.minCases}+ cases`}
                  </td>
                  <td className="px-4 py-3 text-right font-display font-bold text-[#CC2936]">${formatPrice(t.pricePerCase)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Suggested retail: $5&ndash;$6 per can ($60&ndash;$72 per case). At the $35 tier, retailers can earn $25&ndash;$37 gross profit per case.
        </p>
        <ul className="mt-3 text-xs text-muted-foreground space-y-1 list-disc pl-4">
          <li>Shipping and delivery are quoted separately.</li>
          <li>Pricing is subject to availability and applies to a single order.</li>
          <li>Business orders may require a valid resale certificate where applicable.</li>
          <li>Payment arrangements must be confirmed before fulfillment.</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Business Name *</label>
            <input type="text" required value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Contact Name *</label>
            <input type="text" required value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <input type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Business Type</label>
            <select value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value as typeof form.businessType })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="store">Store / Retail</option>
              <option value="restaurant">Restaurant / Cafe</option>
              <option value="event">Event / Catering</option>
              <option value="distributor">Distributor</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Estimated Volume</label>
            <input type="text" placeholder="e.g. 100 cases/month" value={form.estimatedVolume}
              onChange={(e) => setForm({ ...form, estimatedVolume: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
          <textarea rows={4} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" disabled={submitMutation.isPending}
          className="rounded-lg bg-[#CC2936] hover:bg-[#E63946] text-white px-6 py-2.5 font-semibold transition-colors disabled:opacity-50"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
