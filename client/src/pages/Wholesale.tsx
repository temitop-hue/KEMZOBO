import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Wholesale() {
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
      toast.success("Inquiry submitted! We'll reach out shortly.");
      setForm({ businessName: "", contactName: "", email: "", phone: "", businessType: "other", estimatedVolume: "", message: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageMeta title="Wholesale" description="Carry KEMZOBO at your store, restaurant, or event. Bulk pricing available." path="/wholesale" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        Wholesale Inquiry
      </h1>
      <p className="text-muted-foreground mb-4">
        Carry KEMZOBO at your store, restaurant, or event.
      </p>

      {/* Pricing tiers */}
      <div className="rounded-xl border border-border bg-card p-6 mb-10">
        <h3 className="font-display font-semibold text-lg mb-3">Bulk Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="font-display font-bold text-xl text-[#B91C1C]">~5% off</div>
            <div className="text-muted-foreground mt-1">24+ cases</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="font-display font-bold text-xl text-[#B91C1C]">~9% off</div>
            <div className="text-muted-foreground mt-1">100+ cases</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="font-display font-bold text-xl text-[#B91C1C]">~14% off</div>
            <div className="text-muted-foreground mt-1">500+ cases</div>
          </div>
        </div>
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
          className="rounded-lg bg-[#7F1D1D] hover:bg-[#991B1B] text-white px-6 py-2.5 font-semibold transition-colors disabled:opacity-50"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
}
