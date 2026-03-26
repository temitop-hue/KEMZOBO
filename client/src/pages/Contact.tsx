import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">
        Have a question or feedback? We'd love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Message *</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="rounded-lg bg-hibiscus text-white px-6 py-2.5 font-semibold hover:bg-hibiscus-light transition-colors disabled:opacity-50"
          >
            {submitMutation.isPending ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Get in Touch</h3>
            <p className="text-muted-foreground text-sm">hello@kemzobo.com</p>
            <p className="text-muted-foreground text-sm">(240) 409-2814</p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Payment Methods</h3>
            <p className="text-muted-foreground text-sm">
              We accept credit/debit cards via Stripe, Zelle, Venmo, and cash on delivery.
            </p>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg mb-2">Wholesale</h3>
            <p className="text-muted-foreground text-sm">
              Interested in carrying Kem Zobo at your store, restaurant, or event?{" "}
              <a href="/wholesale" className="text-hibiscus hover:underline">
                Submit a wholesale inquiry
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
