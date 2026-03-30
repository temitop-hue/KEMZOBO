import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function AdminMessages() {
  const { data: messages, isLoading } = trpc.admin.messages.list.useQuery();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-1 h-8 rounded-full bg-[#B91C1C]" /><h1 className="font-display text-2xl font-bold">Contact Messages</h1></div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-lg" />)}
        </div>
      ) : messages && messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-[#B91C1C]/10 p-5 hover:border-hibiscus/20 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{m.email}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  m.status === "new" ? "bg-[#B91C1C] text-white" : "bg-gray-100 text-gray-500"
                }`}>{m.status}</span>
              </div>
              {m.subject && <p className="text-sm font-medium text-foreground mb-1">{m.subject}</p>}
              <p className="text-sm text-muted-foreground">{m.message}</p>
              <p className="text-xs text-muted-foreground mt-3">
                {m.createdAt ? format(new Date(m.createdAt), "MMM d, yyyy 'at' h:mm a") : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No messages yet.</p>
        </div>
      )}
    </div>
  );
}
