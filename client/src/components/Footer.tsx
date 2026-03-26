import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display text-xl font-bold text-gold mb-3">
              Kem Original Zobo
            </h3>
            <p className="text-cream/70 text-sm max-w-md">
              Premium canned hibiscus drinks. Healthy, cultural, refreshing.
              Bringing the authentic taste of Zobo to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gold-light mb-3 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-cream/70 hover:text-gold transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-cream/70 hover:text-gold transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-cream/70 hover:text-gold transition-colors">
                  Wholesale
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-cream/70 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-gold-light mb-3 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li>hello@kemzobo.com</li>
              <li>(240) 409-2814</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 mt-10 pt-6 text-center text-xs text-cream/50">
          &copy; {new Date().getFullYear()} Kem Original Zobo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
