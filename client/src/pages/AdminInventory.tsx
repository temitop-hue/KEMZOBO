import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Minus, AlertTriangle, X } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  sale: "Sale",
  refund_restock: "Refund / restock",
  restock: "Restock",
  manual_adjustment: "Manual adjustment",
  loss: "Loss / damage",
  correction: "Correction",
};

const REASON_COLORS: Record<string, string> = {
  sale: "bg-blue-50 text-blue-700",
  refund_restock: "bg-purple-50 text-purple-700",
  restock: "bg-green-50 text-green-700",
  manual_adjustment: "bg-amber-50 text-amber-700",
  loss: "bg-red-50 text-red-700",
  correction: "bg-gray-100 text-gray-700",
};

export default function AdminInventory() {
  const utils = trpc.useUtils();
  const { data: inventory, isLoading } = trpc.admin.inventory.list.useQuery();
  const { data: movements } = trpc.admin.inventory.movements.useQuery({ limit: 50 });

  const [adjustVariantId, setAdjustVariantId] = useState<number | null>(null);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Inventory</h1>
        </div>
        {inventory && (
          <p className="text-sm text-muted-foreground">
            {inventory.filter((i) => i.isLow).length} low-stock
          </p>
        )}
      </div>

      {/* Stock table */}
      {isLoading ? (
        <div className="animate-pulse h-32 bg-white rounded-xl mb-10" />
      ) : inventory && inventory.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Product</th>
                <th className="text-left px-4 py-3 font-medium text-white">Variant</th>
                <th className="text-right px-4 py-3 font-medium text-white">In stock</th>
                <th className="text-right px-4 py-3 font-medium text-white">Threshold</th>
                <th className="text-left px-4 py-3 font-medium text-white">Updated</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row.variantId} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{row.productName}</div>
                    <div className="text-xs text-muted-foreground">/{row.productSlug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.variantName}
                    {row.variantWeight && <span className="text-xs"> &middot; {row.variantWeight}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-display font-bold ${row.isLow ? "text-red-600" : "text-foreground"}`}>
                      {row.quantityAvailable}
                    </span>
                    {row.isLow && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 inline-block ml-1.5" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.lowStockThreshold}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.updatedAt ? format(new Date(row.updatedAt), "MMM d, h:mm a") : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setAdjustVariantId(row.variantId)}
                      className="text-xs font-semibold text-[#CC2936] hover:underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center mb-10">
          <p className="text-muted-foreground">No inventory yet.</p>
        </div>
      )}

      {/* Recent movements */}
      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent activity</h2>
        {movements && movements.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">When</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Reason</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Δ</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Balance</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Reference / note</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {m.createdAt && format(new Date(m.createdAt), "MMM d, h:mm a")}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-foreground">{m.productName}</div>
                      <div className="text-xs text-muted-foreground">{m.variantName}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REASON_COLORS[m.reason] ?? "bg-gray-100"}`}>
                        {REASON_LABELS[m.reason] ?? m.reason}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono text-sm ${m.quantityDelta < 0 ? "text-red-600" : "text-green-700"}`}>
                      {m.quantityDelta > 0 ? "+" : ""}{m.quantityDelta}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-foreground">{m.balanceAfter}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">
                      {m.reference && <span className="font-mono">{m.reference}</span>}
                      {m.note && <span> &middot; {m.note}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No movements yet.</p>
        )}
      </div>

      {adjustVariantId !== null && inventory && (
        <AdjustModal
          variantId={adjustVariantId}
          row={inventory.find((i) => i.variantId === adjustVariantId)!}
          onClose={() => setAdjustVariantId(null)}
          onSaved={() => {
            setAdjustVariantId(null);
            utils.admin.inventory.list.invalidate();
            utils.admin.inventory.movements.invalidate();
          }}
        />
      )}
    </div>
  );
}

function AdjustModal({
  variantId,
  row,
  onClose,
  onSaved,
}: {
  variantId: number;
  row: { productName: string; variantName: string; quantityAvailable: number | null };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState<"restock" | "manual_adjustment" | "loss" | "correction" | "refund_restock">("restock");
  const [note, setNote] = useState("");

  const adjustMutation = trpc.admin.inventory.adjust.useMutation({
    onSuccess: (data) => {
      toast.success(`Stock now ${data.balanceAfter}`);
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(delta, 10);
    if (Number.isNaN(n) || n === 0) {
      toast.error("Enter a non-zero number (e.g. 50 to add, -3 to subtract)");
      return;
    }
    adjustMutation.mutate({ variantId, delta: n, reason, note: note || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">Adjust stock</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-lg bg-[#FAFAFA] p-3 text-sm">
            <div className="font-medium text-foreground">{row.productName}</div>
            <div className="text-xs text-muted-foreground">{row.variantName} &middot; current: {row.quantityAvailable}</div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Quantity change *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDelta(delta.startsWith("-") ? delta.slice(1) : "-" + delta)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                {delta.startsWith("-") ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <input
                type="number"
                step="1"
                placeholder="50 to add, -3 to subtract"
                value={delta}
                onChange={(e) => setDelta(e.target.value)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            >
              <option value="restock">Restock (new inventory arrived)</option>
              <option value="refund_restock">Refund — return to stock</option>
              <option value="manual_adjustment">Manual adjustment</option>
              <option value="loss">Loss / damage</option>
              <option value="correction">Correction (count error)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Note (optional)</label>
            <input
              type="text"
              placeholder="e.g. PO-1234, supplier delivery"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={adjustMutation.isPending}
              className="rounded-lg bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
            >
              {adjustMutation.isPending ? "Saving..." : "Save adjustment"}
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
