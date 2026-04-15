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
      <div className="min-h-screen bg-[#1a0508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#1a0508] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">Access denied.</p>
          <Link href="/" className="text-white font-semibold hover:underline">
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
    <div className="min-h-screen bg-[#FDF2F2] flex">

      {/* ─── Sidebar (desktop) — Dark hibiscus red ────────── */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#DC2626]">
        {/* Logo area */}
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/images/logo-dark.png" alt="KEMZOBO" className="h-10 w-auto" />
          </Link>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.25em] mt-2 font-medium">
            Admin Portal
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive(link.href)
                  ? "bg-white text-[#DC2626] shadow-lg shadow-black/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/10 hover:text-red-200 transition-all w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>

          {/* User info */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
                {(user.name || user.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name || "Admin"}</p>
                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile header — Hibiscus red ─────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#DC2626]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/80">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <img src="/images/logo-dark.png" alt="KEMZOBO" className="h-7 w-auto" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Admin</span>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-14 bottom-0 w-64 bg-[#DC2626] z-50 overflow-y-auto">
              <nav className="px-3 py-4 space-y-1">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive(link.href)
                        ? "bg-white text-[#DC2626]"
                        : "text-white/70 hover:bg-white/10"
                    )}
                  >
                    <link.icon className="h-[18px] w-[18px]" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-white/10 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Site
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white w-full text-left"
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
        <div className="pt-14 lg:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
