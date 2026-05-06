export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-16">
        <h1 className="font-rajdhani text-3xl md:text-4xl font-bold text-white mb-2">Refund Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 2026</p>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Our Guarantee</h2>
            <p>
              If we are unable to complete your account upgrade for any reason, you are entitled to a full refund. No questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Eligibility</h2>
            <ul className="space-y-2 list-none">
              {[
                "Upgrade was not delivered within 10 business days of credential submission.",
                "The upgraded account was reverted or banned within 30 days through no fault of the customer.",
                "Customer provided correct credentials and followed all instructions.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-orange-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">Non-Refundable Cases</h2>
            <ul className="space-y-2 list-none">
              {[
                "Customer changed their account password during the upgrade window.",
                "Customer enabled two-factor authentication after placing the order without notifying us.",
                "The upgrade was completed successfully but the customer changed their mind.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">How to Request a Refund</h2>
            <p>
              Contact us with your order number and a description of the issue. We will respond within 24 hours and process eligible refunds within 3–5 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
