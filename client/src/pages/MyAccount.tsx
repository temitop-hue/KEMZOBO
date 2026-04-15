import PageMeta from "@/components/PageMeta";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { Link } from "wouter";
import { format } from "date-fns";

export default function MyAccount() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const { data: orders } = trpc.orders.myOrders.useQuery(undefined, { enabled: !!user });

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-muted rounded w-1/3 mb-8" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PageMeta title="My Account" path="/my-account" />
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">My Account</h1>
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-[#CC2936] transition-colors">
          Sign Out
        </button>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="font-display font-semibold text-lg mb-3">Profile</h2>
        <div className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Name:</span> {user?.name || "—"}</p>
          <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
        </div>
      </div>

      {/* Orders */}
      <h2 className="font-display font-semibold text-lg mb-4">Order History</h2>
      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/order/${order.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:border-hibiscus/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{order.orderNumber}</span>
                  <span className="text-sm text-muted-foreground ml-3">
                    {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-muted capitalize">
                    {order.status}
                  </span>
                  <span className="font-display font-bold">${formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No orders yet.</p>
      )}
    </div>
  );
}
