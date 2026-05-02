import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminPackList() {
  const { data: queue, isLoading } = trpc.admin.fulfillment.queue.useQuery();

  // "To pack" orders only — packed orders already have tracking
  const orders = (queue ?? []).filter((o) => o.status !== "packed");

  return (
    <div className="bg-white min-h-screen">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden border-b border-border p-4 sticky top-0 bg-white z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/fulfillment"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to fulfillment
          </Link>
          <span className="text-xs text-muted-foreground">{orders.length} order{orders.length === 1 ? "" : "s"} to pack</span>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors"
        >
          <Printer className="h-4 w-4" /> Print all
        </button>
      </div>

      {/* Printable content */}
      <div className="max-w-3xl mx-auto p-6 print:p-8">
        <div className="text-center mb-6 print:mb-4">
          <h1 className="font-display text-2xl font-bold text-[#CC2936]">KEMZOBO — Pack List</h1>
          <p className="text-xs text-muted-foreground">Generated {format(new Date(), "MMM d, yyyy h:mm a")}</p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            All caught up! Nothing waiting to pack.
          </p>
        ) : (
          <div className="space-y-6 print:space-y-0">
            {orders.map((o, idx) => (
              <article
                key={o.id}
                className={`border-2 border-[#CC2936]/20 rounded-xl p-5 print:rounded-none print:border-black print:break-inside-avoid ${idx > 0 ? "print:mt-6 print:break-before-page" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-border">
                  <div>
                    <p className="font-mono font-bold text-lg text-foreground">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.createdAt && format(new Date(o.createdAt), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total</p>
                    <p className="font-bold text-foreground">${(o.total / 100).toFixed(2)}</p>
                  </div>
                </div>

                {/* Pack list */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-2">Pack</p>
                  <table className="w-full text-sm">
                    <tbody>
                      {o.items?.map((it) => (
                        <tr key={it.id} className="border-b border-border last:border-0">
                          <td className="py-2 text-2xl font-bold text-[#CC2936] w-12">×{it.quantity}</td>
                          <td className="py-2">
                            <div className="font-medium text-foreground">{it.productName}</div>
                            <div className="text-xs text-muted-foreground">{it.variantName}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ship-to */}
                {o.shippingAddress && (
                  <div className="rounded-lg bg-[#FAFAFA] print:bg-transparent print:border print:border-gray-300 p-3">
                    <p className="text-xs uppercase tracking-wider font-bold text-[#CC2936] mb-1">Ship to</p>
                    <p className="font-medium text-foreground">{o.shippingAddress.name}</p>
                    <p className="text-sm">{o.shippingAddress.street}</p>
                    <p className="text-sm">{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</p>
                    {o.shippingAddress.phone && <p className="text-sm text-muted-foreground mt-1">{o.shippingAddress.phone}</p>}
                  </div>
                )}

                {/* Customer email — small, for reference */}
                <p className="text-xs text-muted-foreground mt-3">
                  Confirmation: <span className="font-mono">{o.customerEmail}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
