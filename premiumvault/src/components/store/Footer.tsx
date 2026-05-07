import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer id="support" className="bg-[#08080d] border-t border-white/[0.06] pt-14 pb-8 mt-14">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="font-rajdhani text-2xl font-bold flex items-center gap-0">
              <Image src="/logo.png" alt="PremiumVault" width={56} height={56} className="w-14 h-14 object-contain -my-2" />
              <span className="bg-gradient-to-br from-orange-400 to-rose-400 bg-clip-text text-transparent">
                PremiumVault
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-3 leading-7">
              Your trusted marketplace for premium digital accounts and subscriptions. Instant delivery, lifetime warranty, and unbeatable prices since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-rajdhani text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link href="/products" className="text-gray-400 text-sm hover:text-white transition-colors">Shop All</Link></li>
              <li><Link href="/#products" className="text-gray-400 text-sm hover:text-white transition-colors">Browse Categories</Link></li>
              <li><Link href="/#reviews" className="text-gray-400 text-sm hover:text-white transition-colors">Customer Reviews</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-rajdhani text-lg mb-4 text-white">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/refund-policy" className="text-gray-400 text-sm hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="font-rajdhani text-lg mb-4 text-white">Payment Methods</h4>
            <div className="flex gap-2.5 flex-wrap mt-2">
              <span className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs font-medium text-gray-400 inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.92 3.757 7.17c0 3.387 2.085 4.549 5.602 5.932 2.263.89 3.019 1.631 3.019 2.529 0 1.036-.862 1.631-2.405 1.631-2.232 0-5.11-1.081-7.002-2.116l-.89 5.549C3.801 21.747 6.468 23 10.974 23c2.582 0 4.727-.653 6.165-1.872 1.56-1.36 2.373-3.274 2.373-5.72 0-3.472-2.172-4.66-5.536-6.258z" fill="#6772E5"/>
                </svg>
                Stripe
              </span>
              <span className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs font-medium text-gray-400 inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.56A.77.77 0 0 1 5.7 1.9h6.438c2.14 0 3.623.56 4.421 1.666.375.519.613 1.064.716 1.656.108.626.09 1.37-.054 2.278l-.005.03v.59l.46.26c.389.198.7.423.939.678.39.416.643.943.749 1.568.11.643.073 1.39-.107 2.221-.208.961-.544 1.797-1.003 2.482-.42.628-.95 1.143-1.573 1.535a6.022 6.022 0 0 1-2.017.816c-.714.168-1.528.253-2.422.253H12.09a1.2 1.2 0 0 0-1.183 1.012l-.037.2-.629 3.983-.03.142a.064.064 0 0 1-.063.053H7.076z" fill="#253B80"/>
                  <path d="M19.438 8.14c-.015.097-.032.195-.05.295-.696 3.572-3.073 4.806-6.108 4.806H11.73a.752.752 0 0 0-.742.636l-.79 5.01-.224 1.417a.395.395 0 0 0 .39.457h2.738a.659.659 0 0 0 .651-.557l.027-.138.516-3.274.033-.18a.659.659 0 0 1 .651-.558h.41c2.654 0 4.733-1.078 5.34-4.196.253-1.303.122-2.39-.548-3.153a2.62 2.62 0 0 0-.744-.563z" fill="#179BD7"/>
                </svg>
                PayPal F&F
              </span>
            </div>
          </div>
        </div>

        <div className="text-center pt-7 border-t border-white/[0.06] text-gray-400 text-xs">
          <p>&copy; 2026 PremiumVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
