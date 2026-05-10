"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, User, Shield } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  // TODO: Reviews page — link to a dedicated reviews page or section.
  // Should display verified Trustpilot/customer reviews with ratings,
  // review text, date, and product purchased. Consider adding filters
  // (by product, rating) and pagination.
  { href: "#reviews", label: "Reviews" },
];

const AUTH_LINKS = [
  { href: "/account", label: "My Orders" },
];

export function Navbar() {
  const { totalItems, openCart } = useCartStore();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bannerText, setBannerText] = useState("✨ Must Read Before Purchasing ✨");
  const count = totalItems();
  const prevCount = useRef(count);
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings?key=banner_text")
      .then((r) => r.json())
      .then((data) => { if (data.value) setBannerText(data.value); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const allLinks = isLoggedIn ? [...NAV_LINKS, ...AUTH_LINKS] : NAV_LINKS;

  return (
    <>
      <nav className="sticky top-0 z-[1000] bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 md:px-8 py-3 flex items-center gap-6 relative">
        {/* Logo */}
        <Link
          href="/"
          className="font-rajdhani text-xl font-bold flex items-center gap-0 text-white shrink-0"
          onClick={() => setMobileOpen(false)}
        >
          <Image src="/logo.png" alt="PremiumVault" width={62} height={62} className="w-[62px] h-[62px] object-contain -my-4" />
          <span className="font-jakarta bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            PremiumVault
          </span>
        </Link>

        {/* Nav Links */}
        <ul className="hidden lg:flex items-center gap-5 list-none">
          {allLinks.map(({ href, label }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-gray-400 font-medium text-sm hover:text-white transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Cart */}
          <button
            onClick={openCart}
            className={`relative w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all ${bump ? "scale-110" : "scale-100"} transition-transform duration-200`}
            style={{ touchAction: "manipulation" }}
            aria-label="Open basket"
          >
            <ShoppingCart className="w-4 h-4" />
            {mounted && count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <Link
              href="/account"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors ml-1"
            >
              <User className="w-4 h-4" />
              {session.user.name || "Account"}
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden md:inline-flex text-sm font-medium text-gray-300 hover:text-white transition-colors ml-1"
            >
              Sign In
            </Link>
          )}

          {/* Admin panel — only visible to admins */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 hover:bg-orange-400/20 transition-all px-2.5 py-1.5 rounded-lg ml-1"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{ touchAction: "manipulation" }}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Must Read Banner */}
      <div className="relative z-[999] w-full py-2.5 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(90deg, #1a0a2e 0%, #2d1b4e 15%, #4a1942 30%, #6b2140 45%, #8b4513 55%, #b8860b 65%, #4a6741 80%, #2d4a7a 90%, #1a0a2e 100%)",
        }}
      >
        <Link
          href="#"
          className="relative z-10 text-white font-medium text-sm tracking-wide hover:opacity-90 transition-opacity"
        >
          {bannerText}
        </Link>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[57px] z-[999] bg-[#0a0a12]/98 backdrop-blur-xl flex flex-col px-6 py-6 gap-1 border-t border-white/[0.06]">
          {allLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="text-white font-semibold text-xl py-4 border-b border-white/[0.06] hover:text-orange-400 transition-colors"
            >
              {label}
            </Link>
          ))}
          {isLoggedIn ? (
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="text-orange-400 font-semibold text-xl py-4 border-b border-white/[0.06]"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setMobileOpen(false)}
              className="text-orange-400 font-semibold text-xl py-4"
            >
              Sign In
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-orange-400 font-semibold text-xl py-4"
            >
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </>
  );
}
