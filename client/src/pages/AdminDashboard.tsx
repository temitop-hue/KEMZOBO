import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { ShoppingCart, DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.dashboard.useQuery();

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-white", bg: "bg-[#F87171]" },
    { label: "Revenue", value: `$${formatPrice(stats?.revenue ?? 0)}`, icon: DollarSign, color: "text-white", bg: "bg-[#059669]" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Package, color: "text-white", bg: "bg-[#D97706]" },
    { label: "Low Stock", value: stats?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-white", bg: "bg-[#F87171]" },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header with red accent bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 rounded-full bg-[#F87171]" />
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4">Overview of your KEMZOBO business</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-[#F87171]/10 p-6 hover:shadow-lg hover:shadow-[#F87171]/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.bg} ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-[#F87171]/30" />
            </div>
            <div className="font-display text-3xl font-bold text-foreground mb-1">{card.value}</div>
            <span className="text-sm text-muted-foreground">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Quick stats bar */}
      <div className="bg-[#F87171] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-display text-lg font-bold">Quick Summary</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: stats?.totalOrders ?? 0 },
            { label: "Total Revenue", value: `$${formatPrice(stats?.revenue ?? 0)}` },
            { label: "Pending", value: stats?.pendingOrders ?? 0 },
            { label: "Low Stock Alerts", value: stats?.lowStockCount ?? 0 },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
