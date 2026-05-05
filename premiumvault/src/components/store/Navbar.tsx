"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, KeyRound, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#support", label: "Support" },
];

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = totalItems();

  return (
    <>
      <nav className="sticky top-0 z-[1000] bg-[#0F1412]/95 backdrop-blur-xl border-b border-[#1F8A5B]/30 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-rajdhani text-xl font-bold flex items-center gap-2 text-[#E8F5EE]"
          onClick={() => setMobileOpen(false)}
        >
          <KeyRound className="w-5 h-5 text-[#2ECC71]" />
          PremiumVault
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-[#A0B5A8] font-medium text-[0.95rem] hover:text-[#7DFFB2] transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative bg-[#16221B] border border-[#1F8A5B]/30 rounded-xl px-4 py-2.5 text-[#E8F5EE] font-medium text-[0.95rem] cursor-pointer transition-all hover:border-[#1F8A5B] hover:shadow-[0_0_15px_rgba(31,138,91,0.4)] flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Cart
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#2ECC71] text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden text-[#A0B5A8] hover:text-[#7DFFB2] transition-colors p-1"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] z-[999] bg-[#0F1412]/98 backdrop-blur-xl flex flex-col px-6 py-6 gap-1 border-t border-[#1F8A5B]/30">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-[#E8F5EE] font-semibold text-xl py-4 border-b border-[#1F8A5B]/20 hover:text-[#7DFFB2] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
