import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";

export default function AdminOrders() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order #</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customerEmail}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted capitalize">{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      o.paymentStatus === "paid" ? "bg-earth-green/10 text-earth-green" : "bg-gold/10 text-gold"
                    }`}>{o.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.createdAt ? format(new Date(o.createdAt), "MMM d") : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
