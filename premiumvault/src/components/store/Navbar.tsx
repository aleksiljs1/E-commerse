"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const count = totalItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-zinc-950/80 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-bold text-white">
          PremiumVault
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="#reviews" className="hover:text-white transition-colors">Reviews</Link>
          <Link href="#contact" className="hover:text-white transition-colors">Contact Us</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* Far Right: Browse Products + Cart */}
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:text-white hidden sm:flex"
            >
              Browse Products
            </Button>
          </Link>
          <button
            onClick={openCart}
            className="relative p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Open basket"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
