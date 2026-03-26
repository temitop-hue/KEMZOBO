import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminMessages() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: messages, isLoading } = trpc.admin.messages.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Contact Messages</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded" />)}
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{m.email}</span>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted capitalize">{m.status}</span>
              </div>
              {m.subject && <p className="text-sm font-medium mb-1">{m.subject}</p>}
              <p className="text-sm text-muted-foreground">{m.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {m.createdAt ? format(new Date(m.createdAt), "MMM d, yyyy 'at' h:mm a") : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No messages yet.</p>
      )}
    </div>
  );
}
