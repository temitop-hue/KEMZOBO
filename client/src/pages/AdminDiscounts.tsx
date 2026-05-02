import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, X, Trash2, Tag, Power } from "lucide-react";

export default function AdminDiscounts() {
  const utils = trpc.useUtils();
  const { data: codes, isLoading } = trpc.admin.discounts.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);

  const toggleActive = trpc.admin.discounts.update.useMutation({
    onSuccess: () => {
      toast.success("Code updated");
      utils.admin.discounts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCode = trpc.admin.discounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Code deleted");
      utils.admin.discounts.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Discount codes</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New code
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-32 bg-white rounded-xl" />
      ) : codes && codes.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#CC2936]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-white">Code</th>
                <th className="text-left px-4 py-3 font-medium text-white">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-white">Min order</th>
                <th className="text-left px-4 py-3 font-medium text-white">Uses</th>
                <th className="text-left px-4 py-3 font-medium text-white">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-white">Status</th>
                <th className="text-right px-4 py-3 font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-foreground">{c.code}</div>
                    {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {c.type === "percent" ? `${c.value}% off` : `$${formatPrice(c.value)} off`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.minOrderTotal && c.minOrderTotal > 0 ? `$${formatPrice(c.minOrderTotal)}+` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.usageCount ?? 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {c.validUntil ? format(new Date(c.validUntil), "MMM d, yyyy") : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => toggleActive.mutate({ id: c.id, data: { isActive: c.isActive ? 0 : 1 } })}
                        className="text-muted-foreground hover:text-[#CC2936] p-1 transition-colors"
                        title={c.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete code "${c.code}"?`)) {
                            deleteCode.mutate({ id: c.id });
                          }
                        }}
                        className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Tag className="h-10 w-10 text-[#CC2936]/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No discount codes yet. Create one to start running promos.</p>
        </div>
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            utils.admin.discounts.list.invalidate();
          }}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"percent" | "fixed_amount">("percent");
  const [value, setValue] = useState("");
  const [minOrderTotal, setMinOrderTotal] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const create = trpc.admin.discounts.create.useMutation({
    onSuccess: () => {
      toast.success("Code created");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Code required");
    const v = parseFloat(value);
    if (Number.isNaN(v) || v <= 0) return toast.error("Discount value required");
    if (type === "percent" && v > 100) return toast.error("Percent can't exceed 100");

    create.mutate({
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      type,
      value: type === "percent" ? Math.round(v) : Math.round(v * 100), // fixed = cents
      minOrderTotal: minOrderTotal ? Math.round(parseFloat(minOrderTotal) * 100) : 0,
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
      validUntil: validUntil ? `${validUntil}T23:59:59.999Z` : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl mb-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">New discount code</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Code *</label>
            <input
              type="text" required value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full font-mono rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="LAUNCH10"
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">Customer types this at checkout. Auto-uppercased.</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Description (internal)</label>
            <input
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              placeholder="Launch week 10% off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Type *</label>
              <select
                value={type} onChange={(e) => setType(e.target.value as typeof type)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              >
                <option value="percent">Percent off</option>
                <option value="fixed_amount">Fixed dollar amount off</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">
                Value * {type === "percent" ? "(%)" : "($)"}
              </label>
              <input
                type="number" required step={type === "percent" ? "1" : "0.01"} min="0.01"
                value={value} onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                placeholder={type === "percent" ? "10" : "5.00"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Min order ($)</label>
              <input
                type="number" step="0.01" min="0"
                value={minOrderTotal} onChange={(e) => setMinOrderTotal(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Usage limit</label>
              <input
                type="number" min="1"
                value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Expires (optional)</label>
            <input
              type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={create.isPending}
              className="rounded-lg bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
            >
              {create.isPending ? "Saving..." : "Create code"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
