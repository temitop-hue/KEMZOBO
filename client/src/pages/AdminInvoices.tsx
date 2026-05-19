import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, X, Trash2, Send, CheckCircle2, Printer, FileText, Pencil, MessageCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

export default function AdminInvoices() {
  const utils = trpc.useUtils();
  const { data: invoices, isLoading } = trpc.admin.invoices.list.useQuery();
  const [openId, setOpenId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "draft" | "sent" | "paid" | "overdue">("all");

  const filtered = invoices?.filter((i) => filter === "all" || i.status === filter) ?? [];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Invoices</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "draft", "sent", "paid", "overdue"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full text-xs font-medium px-3 py-1.5 capitalize transition-colors ${
              filter === s
                ? "bg-[#CC2936] text-white"
                : "bg-white border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936]/5"
            }`}
          >
            {s}
            {s !== "all" && invoices && (
              <span className="ml-1 opacity-70">({invoices.filter((i) => i.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-white rounded-xl" />
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-white">Client</th>
                <th className="text-left px-4 py-3 font-medium text-white">Status</th>
                <th className="text-left px-4 py-3 font-medium text-white">Issued</th>
                <th className="text-left px-4 py-3 font-medium text-white">Due</th>
                <th className="text-right px-4 py-3 font-medium text-white">Total</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setOpenId(inv.id)}
                  className="border-t border-border hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground font-mono">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-foreground">{inv.clientName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[inv.status ?? "draft"]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {inv.issuedAt && format(new Date(inv.issuedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {inv.dueAt && format(new Date(inv.dueAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${formatPrice(inv.total)}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setOpenId(inv.id)}
                      className="text-xs font-medium text-[#CC2936] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <FileText className="h-10 w-10 text-[#CC2936]/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No invoices {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
        </div>
      )}

      {showCreate && (
        <CreateInvoiceModal onClose={() => setShowCreate(false)} onSaved={() => {
          setShowCreate(false);
          utils.admin.invoices.list.invalidate();
        }} />
      )}

      {openId !== null && (
        <InvoiceDetailModal id={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

function InvoiceDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: invoice } = trpc.admin.invoices.getById.useQuery({ id });
  const [editing, setEditing] = useState(false);

  const markSent = trpc.admin.invoices.markSent.useMutation({
    onSuccess: () => {
      toast.success("Marked sent");
      utils.admin.invoices.list.invalidate();
      utils.admin.invoices.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const markPaid = trpc.admin.invoices.markPaid.useMutation({
    onSuccess: () => {
      toast.success("Marked paid");
      utils.admin.invoices.list.invalidate();
      utils.admin.invoices.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelInvoice = trpc.admin.invoices.cancel.useMutation({
    onSuccess: () => {
      toast.success("Invoice cancelled");
      utils.admin.invoices.list.invalidate();
      utils.admin.invoices.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const sendEmail = trpc.admin.invoices.sendEmail.useMutation({
    onSuccess: () => {
      toast.success("Emailed to client. Invoice marked as sent.");
      utils.admin.invoices.list.invalidate();
      utils.admin.invoices.getById.invalidate({ id });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted");
      utils.admin.invoices.list.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  // Open edit modal — early return so the rest of the detail modal hides
  if (editing && invoice) {
    return (
      <EditInvoiceModal
        invoice={invoice}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          utils.admin.invoices.list.invalidate();
          utils.admin.invoices.getById.invalidate({ id });
        }}
      />
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto print:bg-white print:p-0 print:overflow-visible"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl mb-10 print:shadow-none print:rounded-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header — hidden in print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#CC2936] text-white print:hidden">
          <div>
            <h2 className="font-display text-lg font-bold font-mono">{invoice.invoiceNumber}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-2.5 py-1 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable invoice body */}
        <div className="p-8 print:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="font-display text-3xl font-bold text-[#CC2936] mb-1">KEMZOBO</h1>
              <p className="text-xs text-muted-foreground">The Original Zobo Drink</p>
              <p className="text-xs text-muted-foreground mt-1">info@kemzobo.com</p>
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
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3 mb-2">Due</p>
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
              {invoice.items?.map((it) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="py-3 text-foreground">{it.description}</td>
                  <td className="py-3 text-center text-muted-foreground">{it.quantity}</td>
                  <td className="py-3 text-right text-muted-foreground">${formatPrice(it.unitPrice)}</td>
                  <td className="py-3 text-right font-medium">${formatPrice(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
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
                <span>${formatPrice(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-[#FAFAFA] rounded-lg p-4 text-sm">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">Notes</p>
              <p className="text-foreground whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Action footer — hidden in print */}
        <div className="border-t border-border bg-[#FAFAFA] px-6 py-4 flex flex-wrap items-center gap-2 print:hidden">
          {/* Send via Email — works on any status as long as we have an email */}
          {invoice.clientEmail && invoice.status !== "cancelled" && (
            <button
              onClick={() => {
                if (confirm(`Email invoice ${invoice.invoiceNumber} to ${invoice.clientEmail}?`)) {
                  sendEmail.mutate({ id: invoice.id });
                }
              }}
              disabled={sendEmail.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sendEmail.isPending ? "Sending..." : "Email"}
            </button>
          )}

          {/* Send via WhatsApp — click-to-WhatsApp deep link with prefilled message */}
          {invoice.clientPhone && invoice.status !== "cancelled" && (
            <a
              href={buildWhatsAppLink(invoice)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] text-white px-4 py-2 text-sm font-semibold hover:bg-[#1DA851] transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          )}

          {/* Edit (drafts + sent + overdue; lock paid + cancelled) */}
          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#CC2936]/30 text-[#CC2936] px-4 py-2 text-sm font-semibold hover:bg-[#CC2936] hover:text-white transition-colors"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}

          {invoice.status === "draft" && (
            <button
              onClick={() => markSent.mutate({ id: invoice.id })}
              disabled={markSent.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 text-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
            >
              Mark Sent
            </button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <button
              onClick={() => markPaid.mutate({ id: invoice.id })}
              disabled={markPaid.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark Paid
            </button>
          )}
          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <button
              onClick={() => {
                if (confirm("Cancel this invoice?")) cancelInvoice.mutate({ id: invoice.id });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border text-muted-foreground px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={() => {
                if (confirm(`Permanently delete invoice ${invoice.invoiceNumber}?`)) {
                  deleteMutation.mutate({ id: invoice.id });
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 text-red-600 px-3 py-2 text-xs font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type DraftItem = { description: string; quantity: string; unitPrice: string };

function CreateInvoiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [dueAt, setDueAt] = useState(due.toISOString().slice(0, 10));
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([{ description: "", quantity: "1", unitPrice: "" }]);

  const create = trpc.admin.invoices.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.invoiceNumber} created`);
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const subtotal = items.reduce((sum, it) => {
    const qty = parseInt(it.quantity, 10) || 0;
    const price = Math.round(parseFloat(it.unitPrice || "0") * 100);
    return sum + qty * price;
  }, 0);
  const taxCents = Math.round(parseFloat(tax || "0") * 100);
  const total = subtotal + taxCents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return toast.error("Client name required");

    const validItems = items
      .filter((it) => it.description.trim() && parseFloat(it.unitPrice) > 0)
      .map((it) => ({
        description: it.description.trim(),
        quantity: parseInt(it.quantity, 10),
        unitPrice: Math.round(parseFloat(it.unitPrice) * 100),
      }));
    if (validItems.length === 0) return toast.error("At least one valid line item required");

    create.mutate({
      clientName: clientName.trim(),
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      clientAddress: clientAddress || undefined,
      dueAt: `${dueAt}T23:59:59.999Z`,
      tax: taxCents,
      notes: notes || undefined,
      items: validItems,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">New invoice</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Client name *</label>
              <input
                type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                placeholder="Acme Restaurants Inc."
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email</label>
              <input
                type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                placeholder="orders@acme.com"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Phone</label>
              <input
                type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Due date *</label>
              <input
                type="date" required value={dueAt} onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Address</label>
            <textarea
              rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Line items *</label>
              <button
                type="button"
                onClick={() => setItems([...items, { description: "", quantity: "1", unitPrice: "" }])}
                className="text-xs text-[#CC2936] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input
                    type="text" placeholder="Description (e.g. Case of 24, Original Zobo)"
                    value={it.description}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, description: e.target.value }; setItems(next);
                    }}
                    className="col-span-6 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                  />
                  <input
                    type="number" min="1" placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, quantity: e.target.value }; setItems(next);
                    }}
                    className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                  />
                  <input
                    type="number" step="0.01" min="0" placeholder="$ each"
                    value={it.unitPrice}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, unitPrice: e.target.value }; setItems(next);
                    }}
                    className="col-span-3 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                  />
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                    className="col-span-1 text-muted-foreground hover:text-red-500 p-2 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tax + notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Tax ($)</label>
              <input
                type="number" step="0.01" min="0" value={tax} onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              />
            </div>
            <div className="text-right self-end">
              <p className="text-xs text-muted-foreground">Subtotal: <span className="text-foreground font-medium">${formatPrice(subtotal)}</span></p>
              <p className="font-display text-xl font-bold mt-1">Total: ${formatPrice(total)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Notes (optional)</label>
            <textarea
              rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="Payment terms, thank-you note, Zelle info, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-lg bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
            >
              {create.isPending ? "Creating..." : "Create draft"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Build a click-to-WhatsApp deep link with the invoice details prefilled.
 * Strips non-digits from the phone (wa.me requires E.164-style without +).
 * Recipient opens WhatsApp with the message already typed — they hit send.
 */
function buildWhatsAppLink(invoice: {
  invoiceNumber: string;
  clientName: string;
  clientPhone: string | null;
  total: number;
  dueAt: string | Date;
  publicToken?: string | null;
}): string {
  const phone = (invoice.clientPhone ?? "").replace(/\D/g, "");
  const dollars = (invoice.total / 100).toFixed(2);
  const due = new Date(invoice.dueAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const viewUrl = invoice.publicToken
    ? `https://kemzobo.com/invoice/${invoice.publicToken}`
    : "https://kemzobo.com";
  const msg = `Hi ${invoice.clientName}! Here's your KEMZOBO invoice ${invoice.invoiceNumber} for $${dollars}, due ${due}.\n\nView details: ${viewUrl}\n\nReply if you have any questions — thanks!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

type EditInvoiceFormItem = { description: string; quantity: string; unitPrice: string };

function EditInvoiceModal({
  invoice,
  onClose,
  onSaved,
}: {
  invoice: {
    id: number;
    clientName: string;
    clientEmail: string | null;
    clientPhone: string | null;
    clientAddress: string | null;
    dueAt: string | Date;
    tax: number | null;
    notes: string | null;
    items?: Array<{ description: string; quantity: number; unitPrice: number }>;
  };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clientName, setClientName] = useState(invoice.clientName);
  const [clientEmail, setClientEmail] = useState(invoice.clientEmail ?? "");
  const [clientPhone, setClientPhone] = useState(invoice.clientPhone ?? "");
  const [clientAddress, setClientAddress] = useState(invoice.clientAddress ?? "");
  const [dueAt, setDueAt] = useState(
    new Date(invoice.dueAt).toISOString().slice(0, 10)
  );
  const [tax, setTax] = useState(((invoice.tax ?? 0) / 100).toFixed(2));
  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [items, setItems] = useState<EditInvoiceFormItem[]>(
    (invoice.items ?? []).map((it) => ({
      description: it.description,
      quantity: String(it.quantity),
      unitPrice: (it.unitPrice / 100).toFixed(2),
    }))
  );

  const update = trpc.admin.invoices.update.useMutation({
    onSuccess: () => {
      toast.success("Invoice updated");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const subtotal = items.reduce((sum, it) => {
    const qty = parseInt(it.quantity, 10) || 0;
    const price = Math.round(parseFloat(it.unitPrice || "0") * 100);
    return sum + qty * price;
  }, 0);
  const taxCents = Math.round(parseFloat(tax || "0") * 100);
  const total = subtotal + taxCents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return toast.error("Client name required");
    const validItems = items
      .filter((it) => it.description.trim() && parseFloat(it.unitPrice) > 0)
      .map((it) => ({
        description: it.description.trim(),
        quantity: parseInt(it.quantity, 10),
        unitPrice: Math.round(parseFloat(it.unitPrice) * 100),
      }));
    if (validItems.length === 0) return toast.error("At least one valid line item required");

    update.mutate({
      id: invoice.id,
      data: {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || null,
        clientPhone: clientPhone.trim() || null,
        clientAddress: clientAddress.trim() || null,
        dueAt: `${dueAt}T23:59:59.999Z`,
        tax: taxCents,
        notes: notes.trim() || null,
        items: validItems,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">Edit invoice</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Client name *</label>
              <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Phone</label>
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Due date *</label>
              <input type="date" required value={dueAt} onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Address</label>
            <textarea rows={2} value={clientAddress} onChange={(e) => setClientAddress(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Line items *</label>
              <button
                type="button"
                onClick={() => setItems([...items, { description: "", quantity: "1", unitPrice: "" }])}
                className="text-xs text-[#CC2936] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <input type="text" placeholder="Description"
                    value={it.description}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, description: e.target.value }; setItems(next);
                    }}
                    className="col-span-6 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
                  <input type="number" min="1" placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, quantity: e.target.value }; setItems(next);
                    }}
                    className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
                  <input type="number" step="0.01" min="0" placeholder="$ each"
                    value={it.unitPrice}
                    onChange={(e) => {
                      const next = [...items]; next[i] = { ...it, unitPrice: e.target.value }; setItems(next);
                    }}
                    className="col-span-3 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
                  <button type="button"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                    disabled={items.length === 1}
                    className="col-span-1 text-muted-foreground hover:text-red-500 p-2 disabled:opacity-30">
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Tax ($)</label>
              <input type="number" step="0.01" min="0" value={tax} onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
            </div>
            <div className="text-right self-end">
              <p className="text-xs text-muted-foreground">Subtotal: <span className="text-foreground font-medium">${(subtotal / 100).toFixed(2)}</span></p>
              <p className="font-display text-xl font-bold mt-1">Total: ${(total / 100).toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Notes</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={update.isPending}
              className="rounded-lg bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50">
              {update.isPending ? "Saving..." : "Save changes"}
            </button>
            <button type="button" onClick={onClose}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
