import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { ShoppingCart, DollarSign, Package, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.dashboard.useQuery();

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-hibiscus", bg: "bg-hibiscus/10" },
    { label: "Revenue", value: `$${formatPrice(stats?.revenue ?? 0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Low Stock Items", value: stats?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5" />
              </div>
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
