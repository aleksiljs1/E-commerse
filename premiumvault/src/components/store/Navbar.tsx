"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <nav className="sticky top-0 z-[1000] bg-[#0F1412]/95 backdrop-blur-xl border-b border-zinc-800 px-5 md:px-10 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="font-rajdhani text-2xl font-bold flex items-center gap-2">
        <span>🔐</span>
        <span className="bg-gradient-to-br from-[#1F8A5B] to-[#6ED3A3] bg-clip-text text-transparent">
          Premium Vault
        </span>
      </Link>

      {/* Nav Links */}
      <ul className="hidden md:flex items-center gap-8 list-none">
        <li>
          <Link href="/products" className="text-[#A0B5A8] font-medium text-[0.95rem] hover:text-[#7DFFB2] transition-colors">
            Shop
          </Link>
        </li>
        <li>
          <Link href="#reviews" className="text-[#A0B5A8] font-medium text-[0.95rem] hover:text-[#7DFFB2] transition-colors">
            Reviews
          </Link>
        </li>
        <li>
          <Link href="#" className="text-[#A0B5A8] font-medium text-[0.95rem] hover:text-[#7DFFB2] transition-colors">
            Blog
          </Link>
        </li>
        <li>
          <Link href="#support" className="text-[#A0B5A8] font-medium text-[0.95rem] hover:text-[#7DFFB2] transition-colors">
            Support
          </Link>
        </li>
      </ul>

      {/* Cart Button */}
      <button
        onClick={openCart}
        className="relative bg-[#16221B] border border-zinc-800 rounded-xl px-4 py-2.5 text-[#E8F5EE] font-medium text-[0.95rem] cursor-pointer transition-all hover:border-[#1F8A5B] hover:shadow-[0_0_15px_rgba(31,138,91,0.4)]"
      >
        🛒 Cart
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#2ECC71] text-white text-[0.7rem] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </nav>
  );
}
