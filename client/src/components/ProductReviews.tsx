import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, CheckCircle2 } from "lucide-react";

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${n <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-300"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ productId }: { productId: number }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.reviews.byProduct.useQuery({ productId });
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20" id="reviews">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-[#CC2936] text-xs uppercase tracking-[0.3em] font-bold mb-2">Reviews</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">What people are saying</h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-[#CC2936] text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
        >
          Write a review
        </button>
      </div>

      {/* Summary card */}
      {data && data.summary.count > 0 && (
        <div className="rounded-2xl bg-white border border-[#CC2936]/10 p-6 mb-8 flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div className="font-display text-5xl font-bold text-foreground">
              {data.summary.average.toFixed(1)}
            </div>
            <div className="mt-1"><StarRow rating={Math.round(data.summary.average)} size="md" /></div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.count} review{data.summary.count === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            utils.reviews.byProduct.invalidate({ productId });
          }}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : data && data.reviews.length > 0 ? (
        <div className="space-y-4">
          {data.reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-white border border-[#CC2936]/10 p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <StarRow rating={r.rating} />
                  <span className="font-semibold text-foreground text-sm">{r.customerName}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.createdAt && format(new Date(r.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              {r.title && <p className="font-display font-bold text-foreground mb-1">{r.title}</p>}
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{r.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-border p-8 text-center">
          <p className="text-muted-foreground">No reviews yet — be the first to share what you think.</p>
        </div>
      )}
    </section>
  );
}

function ReviewForm({ productId, onClose, onSaved }: {
  productId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = trpc.reviews.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.verified ? "Review posted — thanks!" : "Review posted — thanks!");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Pick a star rating");
    if (body.trim().length < 10) return toast.error("Tell us a little more (10 chars min)");
    submit.mutate({
      productId,
      orderNumber: orderNumber.trim() || undefined,
      customerEmail: email.trim(),
      customerName: name.trim(),
      rating,
      title: title.trim() || undefined,
      body: body.trim(),
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-[#CC2936]/15 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">Leave a review</h3>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-red-500 underline">
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star picker */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Your rating *</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={`h-7 w-7 ${(hoverRating || rating) >= n ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-300"} transition-colors`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Your name *</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              maxLength={120}
              placeholder="First name or initials"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Email *</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="not shown publicly"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">
            Order number <span className="text-muted-foreground font-normal">(optional — adds Verified Purchase badge)</span>
          </label>
          <input
            type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            className="w-full font-mono rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            placeholder="KZ-10042"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Headline (optional)</label>
          <input
            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            maxLength={200}
            placeholder="Best part of my cookout"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-1.5 block">Your review *</label>
          <textarea
            required rows={4} value={body} onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            maxLength={2000}
            placeholder="What did you think?"
          />
          <p className="text-xs text-muted-foreground mt-1">{body.length} / 2000</p>
        </div>

        <button
          type="submit" disabled={submit.isPending}
          className="rounded-full bg-[#CC2936] text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#E63946] transition-colors disabled:opacity-50"
        >
          {submit.isPending ? "Posting..." : "Post review"}
        </button>
      </form>
    </div>
  );
}
