import { useState } from "react";
import { Download, FileText, ShoppingCart, Boxes } from "lucide-react";

function isoDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Year to date", ytd: true },
];

export default function AdminReports() {
  const today = new Date();
  const [from, setFrom] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 30);
    return isoDateOnly(d);
  });
  const [to, setTo] = useState(isoDateOnly(today));

  const setPreset = (p: (typeof PRESETS)[number]) => {
    const start = new Date(today);
    if (p.ytd) start.setMonth(0, 1);
    else if (p.days) start.setDate(start.getDate() - p.days);
    setFrom(isoDateOnly(start));
    setTo(isoDateOnly(today));
  };

  const dateRangeQuery = `?from=${from}T00:00:00.000Z&to=${to}T23:59:59.999Z`;

  const reports = [
    {
      icon: ShoppingCart,
      title: "Orders",
      description: "All orders in the date range — customer, address, status, totals, tracking.",
      href: `/api/admin/exports/orders.csv${dateRangeQuery}`,
      filename: `kemzobo-orders-${from}-to-${to}.csv`,
      hasDateRange: true,
    },
    {
      icon: FileText,
      title: "Revenue summary",
      description: "Daily breakdown of revenue, expenses, and profit. Includes a totals row.",
      href: `/api/admin/exports/revenue.csv${dateRangeQuery}`,
      filename: `kemzobo-revenue-${from}-to-${to}.csv`,
      hasDateRange: true,
    },
    {
      icon: Boxes,
      title: "Inventory snapshot",
      description: "Current stock levels for every variant. Low-stock items flagged.",
      href: `/api/admin/exports/inventory.csv`,
      filename: `kemzobo-inventory-${isoDateOnly(today)}.csv`,
      hasDateRange: false,
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-[#CC2936]" />
        <h1 className="font-display text-2xl font-bold">Reports</h1>
      </div>

      {/* Date range */}
      <div className="mb-8 bg-white rounded-2xl border border-[#CC2936]/10 p-5">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">Date range (used for orders + revenue)</p>
        <div className="flex flex-wrap items-end gap-3">
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
      </div>

      {/* Download cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((r) => (
          <div key={r.title} className="bg-white rounded-2xl border border-[#CC2936]/10 p-5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-[#CC2936]/10 p-2">
                <r.icon className="h-5 w-5 text-[#CC2936]" />
              </div>
              <h2 className="font-display font-bold text-foreground">{r.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{r.description}</p>
            <a
              href={r.href}
              download={r.filename}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#CC2936] text-white px-4 py-2 text-sm font-semibold hover:bg-[#E63946] transition-colors"
            >
              <Download className="h-4 w-4" /> Download CSV
            </a>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        CSVs are UTF-8 with a BOM, so Excel and Google Sheets handle accents and emojis correctly.
      </p>
    </div>
  );
}
