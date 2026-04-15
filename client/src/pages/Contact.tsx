import PageMeta from "@/components/PageMeta";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent! A member of the KEMZOBO team will get back to you.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <PageMeta title="Contact" description="Have a question or wholesale interest? Reach out to the KEMZOBO team." path="/contact" />
      <div className="text-center mb-12">
        <p className="text-[#F87171] font-bold text-sm uppercase tracking-[0.3em] font-medium mb-4">
          Get in Touch
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-lg">
          Have a question, partnership inquiry, or wholesale interest? We'd love to hear
          from you. Reach out and a member of the KEMZOBO team will get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Name *</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-hibiscus/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Email *</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-hibiscus/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus focus:bg-white transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
          <input type="text" value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-lg border border-hibiscus/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus focus:bg-white transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Message *</label>
          <textarea required rows={5} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border border-hibiscus/15 bg-hibiscus-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hibiscus focus:bg-white transition-colors"
          />
        </div>
        <button type="submit" disabled={submitMutation.isPending}
          className="rounded-full bg-[#F87171] hover:bg-[#FCA5A5] text-white px-8 py-3 font-semibold transition-colors disabled:opacity-50"
        >
          {submitMutation.isPending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
