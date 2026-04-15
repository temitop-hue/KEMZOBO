import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#F87171] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img
              src="/images/logo-dark.png"
              alt="KEMZOBO"
              className="h-14 w-auto mb-4"
            />
            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
              THE ORIGINAL ZOBO DRINK. Bold hibiscus. Timeless tradition. Ready to drink.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/products", label: "Shop" },
                { href: "/about", label: "Our Story" },
                { href: "/gallery", label: "Gallery" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-white/60 hover:text-white transition-colors">Wholesale</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} KEMZOBO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
