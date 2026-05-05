import Link from "next/link";

export function Footer() {
  return (
    <footer id="support" className="bg-[#141420] border-t border-[#1e1e2e] pt-14 pb-8 px-5 md:px-10 mt-14">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 max-w-[1200px] mx-auto mb-10">
        {/* Brand */}
        <div>
          <div className="font-rajdhani text-2xl font-bold flex items-center gap-2">
            <span>🔐</span>
            <span className="bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">
              Premium Vault
            </span>
          </div>
          <p className="text-[#a1a1aa] text-sm mt-3 leading-7">
            Your trusted marketplace for premium digital accounts and subscriptions. Instant delivery, lifetime warranty, and unbeatable prices since 2020.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link href="/products" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Shop All</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Flash Deals</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">New Arrivals</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Best Sellers</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-white">Support</h4>
          <ul className="space-y-2.5">
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Help Center</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Contact Us</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Refund Policy</Link></li>
            <li><Link href="#" className="text-[#a1a1aa] text-sm hover:text-purple-600 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <h4 className="font-rajdhani text-lg mb-4 text-white">Payment Methods</h4>
          <div className="flex gap-2.5 flex-wrap mt-2">
            {["💳 Stripe", "🅿️ PayPal", "₿ Bitcoin", "💎 USDT", "⟠ Ethereum"].map((method) => (
              <span
                key={method}
                className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3.5 py-2 text-xs font-medium text-[#a1a1aa]"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center pt-7 border-t border-[#1e1e2e] text-[#a1a1aa] text-xs max-w-[1200px] mx-auto">
        <p>&copy; 2024 Premium Vault. All rights reserved.</p>
      </div>
    </footer>
  );
}
