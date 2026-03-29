import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminWholesale() {
  const { data: requests, isLoading } = trpc.admin.wholesale.list.useQuery();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Wholesale Inquiries</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-lg" />)}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-border p-5 hover:border-hibiscus/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">{r.businessName}</h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 capitalize">
                  {r.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{r.contactName} — {r.email} {r.phone && `— ${r.phone}`}</p>
                <p>Type: <span className="capitalize">{r.businessType}</span> | Volume: {r.estimatedVolume || "—"}</p>
                {r.message && <p className="mt-2 text-foreground/70">{r.message}</p>}
                <p className="text-xs mt-2">
                  {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No wholesale inquiries yet.</p>
        </div>
      )}
    </div>
  );
}
