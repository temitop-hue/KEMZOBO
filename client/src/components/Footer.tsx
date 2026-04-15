import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <img src="/images/New_Logo.jpeg" alt="KEMZOBO" className="h-14 w-auto rounded-md mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              THE ORIGINAL ZOBO DRINK. Bold hibiscus. Timeless tradition. Ready to drink.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#CC2936] uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/products", label: "Shop" },
                { href: "/about", label: "Our Story" },
                { href: "/gallery", label: "Gallery" },
                { href: "/faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-[#CC2936] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#CC2936] uppercase tracking-wider mb-4">Connect</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="text-gray-500 hover:text-[#CC2936] transition-colors">Contact Us</Link></li>
              <li><Link href="/wholesale" className="text-gray-500 hover:text-[#CC2936] transition-colors">Wholesale</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-[#CC2936] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} KEMZOBO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
