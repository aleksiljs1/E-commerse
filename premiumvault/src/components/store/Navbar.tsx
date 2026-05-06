"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";

const NAV_LINKS = [
  { href: "/products", label: "Accounts" },
  { href: "#reviews", label: "Feedbacks" },
  { href: "#", label: "Blog" },
  { href: "#support", label: "Help Center" },
];

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = totalItems();
  const prevCount = useRef(count);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <>
      <nav className="sticky top-0 z-[1000] bg-[#0F1412]/95 backdrop-blur-xl border-b border-[#1F8A5B]/30 px-6 md:px-10 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-rajdhani text-xl font-bold flex items-center gap-2 text-[#E8F5EE]"
          onClick={() => setMobileOpen(false)}
        >
          PremiumVault
        </Link>

        {/* Nav Links */}
        <ul className="hidden lg:flex items-center gap-7 list-none">
          <li>
            <Link
              href="/products"
              className="text-[#A0B5A8] font-medium text-[0.9rem] hover:text-[#7DFFB2] transition-colors inline-flex items-center gap-1"
            >
              Accounts
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-px">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
          <li>
            <Link href="#reviews" className="text-[#A0B5A8] font-medium text-[0.9rem] hover:text-[#7DFFB2] transition-colors">
              Feedbacks
            </Link>
          </li>
          <li>
            <Link href="#" className="text-[#A0B5A8] font-medium text-[0.9rem] hover:text-[#7DFFB2] transition-colors">
              Blog
            </Link>
          </li>
          <li>
            <Link href="#support" className="text-[#A0B5A8] font-medium text-[0.9rem] hover:text-[#7DFFB2] transition-colors">
              Help Center
            </Link>
          </li>
        </ul>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-[#16221B] border border-zinc-800 rounded-lg px-3 py-2 gap-2 w-56 focus-within:border-[#1F8A5B] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#A0B5A8]">
            <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none text-[#E8F5EE] text-[0.85rem] placeholder:text-[#A0B5A8]/50 w-full"
            readOnly
          />
        </div>

        {/* Right: Cart + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={openCart}
            className={`relative bg-[#16221B] border border-[#1F8A5B]/30 rounded-xl px-4 py-2.5 text-[#E8F5EE] font-medium text-[0.95rem] cursor-pointer transition-all hover:border-[#1F8A5B] hover:shadow-[0_0_15px_rgba(31,138,91,0.4)] flex items-center gap-2 ${bump ? "scale-125" : "scale-100"} transition-transform duration-200`}
            aria-label="Open basket"
          >
            <ShoppingCart className="w-4 h-4" /> Cart
            {mounted && count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#2ECC71] text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden text-[#A0B5A8] hover:text-[#7DFFB2] transition-colors p-1"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[61px] z-[999] bg-[#0F1412]/98 backdrop-blur-xl flex flex-col px-6 py-6 gap-1 border-t border-[#1F8A5B]/30">
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
