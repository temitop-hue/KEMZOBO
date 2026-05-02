import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";
import { Star, CheckCircle2, EyeOff, Trash2, MessageSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-gray-100 text-gray-500 line-through",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-300"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.admin.reviews.list.useQuery();

  const setStatus = trpc.admin.reviews.setStatus.useMutation({
    onSuccess: () => {
      toast.success("Review updated");
      utils.admin.reviews.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteReview = trpc.admin.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Review deleted");
      utils.admin.reviews.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Reviews</h1>
        </div>
        {reviews && (
          <p className="text-sm text-muted-foreground">{reviews.length} total</p>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-white rounded-xl" />
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-[#CC2936]/10 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <StarRow rating={r.rating} />
                  <span className="font-semibold text-foreground">{r.customerName}</span>
                  <span className="text-xs text-muted-foreground">on <strong>{r.productName}</strong></span>
                  {r.orderId && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status ?? "approved"]}`}>
                    {r.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {r.createdAt && format(new Date(r.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              {r.title && <p className="font-display font-bold text-foreground mb-1">{r.title}</p>}
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{r.body}</p>
              <p className="text-xs text-muted-foreground mt-2">{r.customerEmail}</p>

              <div className="mt-3 flex items-center gap-2">
                {r.status !== "approved" && (
                  <button
                    onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}
                    className="text-xs font-semibold text-green-700 hover:underline"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}
                    className="text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
                  >
                    <EyeOff className="h-3 w-3" /> Hide
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Delete this review permanently?")) {
                      deleteReview.mutate({ id: r.id });
                    }
                  }}
                  className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <MessageSquare className="h-10 w-10 text-[#CC2936]/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet.</p>
        </div>
      )}
    </div>
  );
}
