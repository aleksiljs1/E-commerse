export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-16">
        <h1 className="font-rajdhani text-3xl md:text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 2026</p>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Service Description</h2>
            <p>
              PremiumVault provides account upgrade services for third-party subscription platforms. We do not sell accounts — we upgrade existing accounts owned by the customer to a premium tier.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Customer Responsibilities</h2>
            <ul className="space-y-2 list-none">
              {[
                "You must own the account you are submitting for upgrade.",
                "Do not change your password or enable new 2FA during the upgrade window (4–5 business days).",
                "Credentials submitted through our secure link are encrypted and never stored in plain text.",
                "You are responsible for ensuring your account complies with the third-party platform's terms.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. Payment</h2>
            <p>
              Payments are processed via Stripe (card) or PayPal Friends &amp; Family. PayPal F&amp;F payments do not carry PayPal buyer protection. All prices are in GBP and include any applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. Warranty</h2>
            <p>
              All upgrades carry a 30-day warranty. If the upgrade is reversed by the platform within this period through no fault of the customer, we will re-upgrade the account or issue a full refund at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Limitation of Liability</h2>
            <p>
              PremiumVault is not responsible for any action taken by the third-party platform against a customer&apos;s account, including but not limited to account suspension or termination. Our liability is limited to the amount paid for the specific order.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
