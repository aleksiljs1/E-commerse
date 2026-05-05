import Link from "next/link";

export function Footer() {
  return (
    <footer id="support" className="bg-[#16221B] border-t border-zinc-800 pt-14 pb-8 px-5 md:px-10 mt-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 max-w-[1200px] mx-auto mb-10">
        {/* Brand */}
        <div>
          <div className="font-rajdhani text-2xl font-bold flex items-center gap-2">
            <span>🔐</span>
            <span className="bg-gradient-to-br from-[#1F8A5B] to-[#6ED3A3] bg-clip-text text-transparent">
              Premium Vault
            </span>
          </div>
          <p className="text-[#A0B5A8] text-sm mt-3 leading-7">
            Your trusted marketplace for premium digital accounts and subscriptions. Instant delivery, lifetime warranty, and unbeatable prices since 2020.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-[#E8F5EE]">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link href="/products" className="text-[#A0B5A8] text-sm hover:text-[#7DFFB2] transition-colors">Shop All</Link></li>
            <li><Link href="/#products" className="text-[#A0B5A8] text-sm hover:text-[#7DFFB2] transition-colors">Browse Categories</Link></li>
            <li><Link href="/#reviews" className="text-[#A0B5A8] text-sm hover:text-[#7DFFB2] transition-colors">Customer Reviews</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-[#E8F5EE]">Support</h4>
          <ul className="space-y-2.5">
            <li><Link href="/refund-policy" className="text-[#A0B5A8] text-sm hover:text-[#7DFFB2] transition-colors">Refund Policy</Link></li>
            <li><Link href="/terms" className="text-[#A0B5A8] text-sm hover:text-[#7DFFB2] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-[#E8F5EE]">Payment Methods</h4>
          <div className="flex gap-2.5 flex-wrap mt-2">
            {["💳 Stripe", "🅿️ PayPal F&F"].map((method) => (
              <span
                key={method}
                className="bg-[#0F1412] border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-medium text-[#A0B5A8]"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pt-7 border-t border-zinc-800 text-[#A0B5A8] text-xs max-w-[1200px] mx-auto">
        <p>&copy; 2026 Premium Vault. All rights reserved.</p>
      </div>
    </footer>
  );
}
