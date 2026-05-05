"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <nav className="sticky top-0 z-[1000] bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#1e1e2e] px-5 md:px-10 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="font-rajdhani text-2xl font-bold flex items-center gap-2">
        <span>🔐</span>
        <span className="bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Premium Vault
        </span>
      </Link>

      {/* Nav Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        <li>
          <Link href="/products" className="text-[#a1a1aa] font-medium text-[0.95rem] hover:text-white transition-colors">
            Shop
          </Link>
        </li>
        <li>
          <Link href="#reviews" className="text-[#a1a1aa] font-medium text-[0.95rem] hover:text-white transition-colors">
            Reviews
          </Link>
        </li>
        <li>
          <Link href="#" className="text-[#a1a1aa] font-medium text-[0.95rem] hover:text-white transition-colors">
            Blog
          </Link>
        </li>
        <li>
          <Link href="#support" className="text-[#a1a1aa] font-medium text-[0.95rem] hover:text-white transition-colors">
            Support
          </Link>
        </li>
      </ul>

      {/* Cart Button */}
      <button
        onClick={openCart}
        className="relative bg-[#141420] border border-[#1e1e2e] rounded-xl px-4 py-2.5 text-white font-medium text-[0.95rem] cursor-pointer transition-all hover:border-purple-600 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
      >
        🛒 Cart
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </nav>
  );
}
