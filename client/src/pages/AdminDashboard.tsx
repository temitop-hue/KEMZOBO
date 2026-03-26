import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatPrice } from "@shared/const";
import { Link } from "wouter";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const { data: stats } = trpc.admin.dashboard.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 bg-muted rounded w-1/4" /></div>;
  if (user?.role !== "admin") return <div className="p-8 text-center text-muted-foreground">Access denied.</div>;

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-hibiscus" },
    { label: "Revenue", value: `$${formatPrice(stats?.revenue ?? 0)}`, icon: DollarSign, color: "text-earth-green" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0, icon: Package, color: "text-gold" },
    { label: "Low Stock Items", value: stats?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Nav */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/products", label: "Products" },
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/wholesale", label: "Wholesale" },
          { href: "/admin/customers", label: "Customers" },
          { href: "/admin/messages", label: "Messages" },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium bg-muted hover:bg-hibiscus/10 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <div className="font-display text-2xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
