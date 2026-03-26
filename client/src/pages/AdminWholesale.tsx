import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminWholesale() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: requests, isLoading } = trpc.admin.wholesale.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Wholesale Inquiries</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{r.businessName}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted capitalize">
                  {r.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{r.contactName} — {r.email} {r.phone && `— ${r.phone}`}</p>
                <p>Type: {r.businessType} | Volume: {r.estimatedVolume || "—"}</p>
                {r.message && <p className="mt-2">{r.message}</p>}
                <p className="text-xs mt-2">
                  {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No wholesale inquiries yet.</p>
      )}
    </div>
  );
}
