import PageMeta from "@/components/PageMeta";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <PageMeta title="Privacy Policy" path="/privacy" />
      <h1 className="font-display text-4xl font-bold text-foreground mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-neutral max-w-none text-muted-foreground space-y-6 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> March 2026</p>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">Information We Collect</h2>
        <p>
          When you visit kemzobo.com, we may collect personal information you voluntarily provide,
          including your name, email address, shipping address, phone number, and payment information
          when placing an order. We also collect usage data such as pages visited, browser type, and
          referring URL.
        </p>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Respond to your inquiries and support requests</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Improve our website and customer experience</li>
        </ul>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">Payment Security</h2>
        <p>
          All payment processing is handled securely through Stripe. We do not store your credit card
          information on our servers. Stripe's security measures comply with PCI DSS standards.
        </p>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">Cookies</h2>
        <p>
          We use essential cookies to maintain your session and shopping cart. We may also use
          analytics cookies to understand how visitors interact with our site.
        </p>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us. You may also unsubscribe from marketing emails using the link in any email.
        </p>

        <h2 className="font-display text-xl font-bold text-[#F87171] mt-8 mb-3">Contact</h2>
        <p>
          For privacy-related questions, contact us at hello@kemzobo.com.
        </p>
      </div>
    </div>
  );
}
