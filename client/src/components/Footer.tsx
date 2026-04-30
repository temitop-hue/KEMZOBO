import { Link } from "wouter";
import { Instagram, Facebook } from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/kemzobo?igsh=MTlvN2sxYmM0Z3UxZQ==",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.facebook.com/share/18FDehPRau/?mibextid=wwXIfr",
    label: "Facebook",
    icon: Facebook,
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <img src="/images/New_Logo.jpeg" alt="KEMZOBO" className="h-14 w-auto rounded-md mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-5">
              THE ORIGINAL ZOBO DRINK. Bold hibiscus. Timeless tradition. Ready to drink.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`KEMZOBO on ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#CC2936]/15 text-gray-500 hover:bg-[#CC2936] hover:text-white hover:border-[#CC2936] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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
