import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [refundingId, setRefundingId] = useState<number | null>(null);

  const refundMutation = trpc.admin.orders.refund.useMutation({
    onSuccess: (data) => {
      const msg = data.method === "stripe"
        ? "Stripe refund issued. Customer notified."
        : "Marked as refunded. Send Zelle reversal manually.";
      toast.success(msg);
      utils.admin.orders.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setRefundingId(null),
  });

  const handleRefund = (id: number, orderNumber: string, total: number) => {
    const confirmed = window.confirm(
      `Refund order ${orderNumber} for $${formatPrice(total)}?\n\nThis cannot be undone. For card payments the customer is refunded automatically; for Zelle/Venmo you must reverse the payment manually.`
    );
    if (!confirmed) return;
    setRefundingId(id);
    refundMutation.mutate({ id });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2"><div className="w-1 h-8 rounded-full bg-[#CC2936]" /><h1 className="font-display text-2xl font-bold">Orders</h1></div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-lg" />)}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-white">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-white">Status</th>
                <th className="text-left px-4 py-3 font-medium text-white">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-white">Total</th>
                <th className="text-left px-4 py-3 font-medium text-white">Date</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
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
                      o.paymentStatus === "paid"
                        ? "bg-green-50 text-green-700"
                        : o.paymentStatus === "refunded"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-amber-50 text-amber-700"
                    }`}>{o.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.createdAt ? format(new Date(o.createdAt), "MMM d") : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.paymentStatus === "paid" && (
                      <button
                        onClick={() => handleRefund(o.id, o.orderNumber, o.total)}
                        disabled={refundingId === o.id}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936] hover:text-white text-xs font-medium px-2.5 py-1 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {refundingId === o.id ? "Refunding..." : "Refund"}
                      </button>
                    )}
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
