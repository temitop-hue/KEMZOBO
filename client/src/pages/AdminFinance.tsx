import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, X, TrendingUp, TrendingDown, Wallet, Trash2 } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  ingredients: "Ingredients",
  packaging: "Packaging",
  shipping: "Shipping",
  marketing: "Marketing",
  equipment: "Equipment",
  fees: "Fees",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  ingredients: "bg-amber-50 text-amber-700",
  packaging: "bg-blue-50 text-blue-700",
  shipping: "bg-purple-50 text-purple-700",
  marketing: "bg-pink-50 text-pink-700",
  equipment: "bg-indigo-50 text-indigo-700",
  fees: "bg-red-50 text-red-700",
  other: "bg-gray-100 text-gray-700",
};

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Year to date", days: 0, ytd: true },
];

function isoDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function AdminFinance() {
  const utils = trpc.useUtils();
  const today = new Date();
  const [from, setFrom] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return isoDateOnly(d);
  });
  const [to, setTo] = useState(isoDateOnly(today));
  const [showAdd, setShowAdd] = useState(false);

  // tRPC expects ISO datetimes — extend the day boundaries
  const fromIso = `${from}T00:00:00.000Z`;
  const toIso = `${to}T23:59:59.999Z`;

  const { data: summary, isLoading: summaryLoading } = trpc.admin.finance.summary.useQuery({
    from: fromIso,
    to: toIso,
  });
  const { data: expenseList } = trpc.admin.finance.expenses.list.useQuery({
    from: fromIso,
    to: toIso,
  });

  const deleteExpense = trpc.admin.finance.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted");
      utils.admin.finance.summary.invalidate();
      utils.admin.finance.expenses.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const setPreset = (preset: (typeof PRESETS)[number]) => {
    const start = new Date(today);
    if (preset.ytd) {
      start.setMonth(0, 1);
    } else {
      start.setDate(start.getDate() - preset.days);
    }
    setFrom(isoDateOnly(start));
    setTo(isoDateOnly(today));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
          <h1 className="font-display text-2xl font-bold">Finance</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add expense
        </button>
      </div>

      {/* Date range */}
      <div className="mb-8 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPreset(p)}
              className="rounded-full border border-[#CC2936]/30 text-[#CC2936] hover:bg-[#CC2936] hover:text-white text-xs font-medium px-3 py-1.5 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <SummaryCard
          label="Revenue"
          valueCents={summary?.revenueCents}
          loading={summaryLoading}
          icon={TrendingUp}
          accent="#059669"
        />
        <SummaryCard
          label="Expenses"
          valueCents={summary?.expensesCents}
          loading={summaryLoading}
          icon={TrendingDown}
          accent="#CC2936"
        />
        <SummaryCard
          label={summary && summary.profitCents < 0 ? "Net Loss" : "Net Profit"}
          valueCents={summary?.profitCents}
          loading={summaryLoading}
          icon={Wallet}
          accent={summary && summary.profitCents < 0 ? "#CC2936" : "#059669"}
          subtitle={
            summary && summary.revenueCents > 0
              ? `${(summary.margin * 100).toFixed(1)}% margin`
              : undefined
          }
        />
      </div>

      {/* Category breakdown */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-lg font-bold text-foreground mb-3">Spend by category</h2>
          <div className="bg-white rounded-2xl border border-[#CC2936]/10 p-5">
            <div className="space-y-2">
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const pct = summary.expensesCents > 0 ? (amount / summary.expensesCents) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3 text-sm">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] ?? "bg-gray-100"} w-32 text-center`}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      <div className="flex-1 h-2 bg-[#FAFAFA] rounded-full overflow-hidden">
                        <div className="h-full bg-[#CC2936]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-sm w-24 text-right">${formatPrice(amount)}</span>
                      <span className="font-mono text-xs text-muted-foreground w-12 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Expense list */}
      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-3">Expenses</h2>
        {expenseList && expenseList.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#CC2936]/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Description</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {expenseList.map((e) => (
                  <tr key={e.id} className="border-t border-border hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(e.occurredAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[e.category] ?? "bg-gray-100"}`}>
                        {CATEGORY_LABELS[e.category] ?? e.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{e.description}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-foreground">${formatPrice(e.amount)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete this expense ($${formatPrice(e.amount)})?`)) {
                            deleteExpense.mutate({ id: e.id });
                          }
                        }}
                        className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">No expenses logged in this period.</p>
          </div>
        )}
      </div>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSaved={() => {
        setShowAdd(false);
        utils.admin.finance.summary.invalidate();
        utils.admin.finance.expenses.list.invalidate();
      }} />}
    </div>
  );
}

function SummaryCard({
  label,
  valueCents,
  loading,
  icon: Icon,
  accent,
  subtitle,
}: {
  label: string;
  valueCents: number | undefined;
  loading: boolean;
  icon: typeof TrendingUp;
  accent: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#CC2936]/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      {loading ? (
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
      ) : (
        <>
          <p className="font-display text-3xl font-bold" style={{ color: accent }}>
            ${formatPrice(valueCents ?? 0)}
          </p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

function AddExpenseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"ingredients" | "packaging" | "shipping" | "marketing" | "equipment" | "fees" | "other">("ingredients");
  const [description, setDescription] = useState("");
  const [occurredAt, setOccurredAt] = useState(today);

  const create = trpc.admin.finance.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Expense logged");
      onSaved();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dollars = parseFloat(amount);
    if (Number.isNaN(dollars) || dollars <= 0) {
      toast.error("Enter a positive amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    create.mutate({
      amount: Math.round(dollars * 100),
      category,
      description: description.trim(),
      occurredAt: `${occurredAt}T12:00:00.000Z`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg font-bold">Log expense</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="124.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">Date *</label>
              <input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
            >
              {Object.entries(CATEGORY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">Description *</label>
            <input
              type="text"
              placeholder="e.g. Hibiscus flowers — supplier ABC"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC2936]"
              required
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-lg bg-[#CC2936] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#E63946] transition-colors disabled:opacity-50"
            >
              {create.isPending ? "Saving..." : "Save expense"}
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
