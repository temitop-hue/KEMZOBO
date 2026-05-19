import PageMeta from "@/components/PageMeta";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { Printer, FileText, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

/**
 * Public invoice view — viewable by anyone with the token URL.
 * Designed to print cleanly (Cmd/Ctrl+P → Save as PDF). No admin UI.
 */
export default function PublicInvoice() {
  const { token } = useParams<{ token: string }>();
  const { data: invoice, isLoading } = trpc.publicInvoices.getByToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token && (token?.length ?? 0) >= 8 }
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-[#CC2936]/30 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Invoice not found</h1>
        <p className="text-muted-foreground">
          The link you opened isn't valid. Double-check the URL or contact us at info@kemzobo.com.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white print:bg-white">
      <PageMeta
        title={`Invoice ${invoice.invoiceNumber}`}
        description="View your KEMZOBO invoice."
        path={`/invoice/${token}`}
      />

      {/* Toolbar — hidden on print */}
      <div className="print:hidden border-b border-border bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Invoice <span className="font-mono font-bold text-foreground">{invoice.invoiceNumber}</span>
          </p>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-[#CC2936] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#E63946] transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Invoice body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 print:p-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#CC2936] mb-1">KEMZOBO</h1>
            <p className="text-xs text-muted-foreground">The Original Zobo Drink</p>
            <p className="text-xs text-muted-foreground mt-1">info@kemzobo.com</p>
            <p className="text-xs text-muted-foreground">kemzobo.com</p>
          </div>
          <div className="text-right">
            <h2 className="font-display text-2xl font-bold mb-1">INVOICE</h2>
            <p className="font-mono text-sm text-foreground">{invoice.invoiceNumber}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[invoice.status ?? "draft"]}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Bill to + dates */}
        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Bill to</p>
            <p className="font-semibold text-foreground">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-muted-foreground">{invoice.clientEmail}</p>}
            {invoice.clientPhone && <p className="text-muted-foreground">{invoice.clientPhone}</p>}
            {invoice.clientAddress && (
              <p className="text-muted-foreground whitespace-pre-line mt-1">{invoice.clientAddress}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Issued</p>
            <p className="text-foreground">{invoice.issuedAt && format(new Date(invoice.issuedAt), "MMM d, yyyy")}</p>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-4 mb-2">Due</p>
            <p className="text-foreground">{format(new Date(invoice.dueAt), "MMM d, yyyy")}</p>
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm mb-8 border-t border-b border-border">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left py-3 font-medium">Description</th>
              <th className="text-center py-3 font-medium w-20">Qty</th>
              <th className="text-right py-3 font-medium w-28">Unit price</th>
              <th className="text-right py-3 font-medium w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-3 text-foreground">{it.description}</td>
                <td className="py-3 text-center text-muted-foreground">{it.quantity}</td>
                <td className="py-3 text-right text-muted-foreground">${formatPrice(it.unitPrice)}</td>
                <td className="py-3 text-right font-medium">${formatPrice(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-10">
          <div className="w-64 text-sm space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${formatPrice(invoice.subtotal)}</span>
            </div>
            {(invoice.tax ?? 0) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${formatPrice(invoice.tax ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 mt-2 font-display font-bold text-lg">
              <span>Total</span>
              <span className="text-[#CC2936]">${formatPrice(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-[#FAFAFA] rounded-lg p-4 text-sm print:border print:border-gray-300">
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Notes</p>
            <p className="text-foreground whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          Questions? Reply to the email we sent you, or write to <a href="mailto:info@kemzobo.com" className="text-[#CC2936]">info@kemzobo.com</a>.
        </div>
      </div>
    </div>
  );
}
