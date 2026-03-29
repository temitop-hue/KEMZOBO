import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";

export default function AdminOrders() {
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F7F7F7]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.customerEmail}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 capitalize">{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      o.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
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
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      )}
    </div>
  );
}
