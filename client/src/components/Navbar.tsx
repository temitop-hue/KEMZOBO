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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/New_Logo.jpeg" alt="KEMZOBO" className="h-11 w-auto rounded-md" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide reveal-line nav-magnetic transition-colors",
                  location === link.href
                    ? "text-[#CC2936]"
                    : "text-gray-600 hover:text-[#CC2936]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block">
              <User className="h-5 w-5 text-gray-400 hover:text-[#CC2936] transition-colors" />
            </Link>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-400 hover:text-[#CC2936] transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#CC2936] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn("block py-2.5 text-sm font-medium", location === link.href ? "text-[#CC2936]" : "text-gray-600")}
                onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="block py-2.5 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>Account</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
