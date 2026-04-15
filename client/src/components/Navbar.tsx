import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#DC2626] shadow-lg shadow-[#DC2626]/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/logo-dark.png"
              alt="KEMZOBO"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-all duration-200 relative",
                  location === link.href
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
                {location === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block">
              <User className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
            </Link>

            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-white/50 hover:text-white transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#DC2626] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-white/80"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block py-2.5 text-sm font-medium transition-colors",
                  location === link.href ? "text-white" : "text-white/60"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block py-2.5 text-sm font-medium text-white/60"
              onClick={() => setMobileOpen(false)}
            >
              Account
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
