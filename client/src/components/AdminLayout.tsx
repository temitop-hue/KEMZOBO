import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Building2,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/wholesale", label: "Wholesale", icon: Building2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Access denied.</p>
          <Link href="/" className="text-hibiscus font-semibold hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return location === "/admin";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex">
      {/* ─── Sidebar (desktop) ─────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-border">
        {/* Logo area */}
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/images/logo-navbar.png" alt="KEMZOBO" className="h-9 w-auto" />
          </Link>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1.5">
            Admin Portal
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(link.href)
                  ? "bg-hibiscus/10 text-hibiscus"
                  : "text-muted-foreground hover:bg-[#F7F7F7] hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-[#F7F7F7] hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>

          {/* User info */}
          <div className="px-3 pt-3">
            <p className="text-xs font-medium text-foreground truncate">{user.name || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* ─── Mobile header ─────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <img src="/images/logo-navbar.png" alt="KEMZOBO" className="h-7 w-auto" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-14 bottom-0 w-64 bg-white z-50 border-r border-border overflow-y-auto">
              <nav className="px-3 py-4 space-y-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive(link.href)
                        ? "bg-hibiscus/10 text-hibiscus"
                        : "text-muted-foreground hover:bg-[#F7F7F7]"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-border space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Site
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Main content ──────────────────────────────────── */}
      <main className="flex-1 lg:pl-64">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
