import Link from "next/link";
import Image from "next/image";
import { Lock, Shield, Clock, MessageCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden -mt-[65px] pt-[71px] pb-[50px] px-6 md:px-10 text-center">
      {/* Cosmic background image */}
      <Image
        src="/cosmic-bg.png"
        alt=""
        fill
        priority
        className="object-cover pointer-events-none scale-110"
      />
      {/* Bottom fade to blend into page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[1]" style={{ background: "linear-gradient(to bottom, transparent, #0e0c1a)" }} />

      <div className="relative max-w-[860px] mx-auto">
        {/* Brand name */}
        <p className="text-sm font-medium text-gray-400 tracking-widest uppercase mb-4">PremiumVault</p>

        {/* Headline */}
        <h1 className="font-rajdhani text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
          <span className="text-white">Digital subscriptions,</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
            delivered fast
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base text-gray-400 mb-10 max-w-[600px] mx-auto leading-relaxed">
          Secure checkout. Verified delivery. Clear policies. Get premium
          accounts and services delivered within 12-24 hours.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(249,115,22,0.3)]"
            style={{ background: "linear-gradient(to right, #f97316 2%, #f43f5e 50%, #9333ea 98%)" }}
          >
            <Lock className="w-4 h-4" />
            Shop Accounts
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.15] hover:bg-white/[0.08] hover:border-white/[0.25] text-gray-200 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all backdrop-blur-md"
          >
            <Lock className="w-4 h-4" />
            Shop Services
          </Link>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path d="M2 12L5 5L8 8L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold text-white">9,083</span>
            <span className="text-sm text-gray-400">Products Sold</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold text-white">2,171</span>
            <span className="text-sm text-gray-400">Feedbacks</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>12-24h delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Response within 24h</span>
          </div>
        </div>
      </div>
    </section>
  );
}
