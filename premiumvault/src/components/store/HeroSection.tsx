import Link from "next/link";
import Image from "next/image";
import { Lock, Shield, Clock, MessageCircle, ClipboardList, Headphones, Star } from "lucide-react";

type Props = {
  productsSold?: string;
  feedbacks?: string;
};

export function HeroSection({ productsSold = "298", feedbacks = "34" }: Props) {
  const trustItems = [
    { icon: ClipboardList, value: `${productsSold}+`, label: "Orders Delivered" },
    { icon: Lock, value: "Secure", label: "Payment Protection" },
    { icon: Headphones, value: "24h", label: "Support Response" },
    { icon: Star, value: "Trustpilot", label: "Verified Reviews", highlight: true },
  ];
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-97px)] flex flex-col justify-between text-center">
      {/* Cosmic background image */}
      <Image
        src="/cosmic-bg.webp"
        alt=""
        fill
        priority
        className="object-cover pointer-events-none scale-110"
      />
      {/* Bottom fade to blend into page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[1]" style={{ background: "linear-gradient(to bottom, transparent, #0a0a0f)" }} />

      {/* Main content — centered vertically */}
      <div className="relative z-10 max-w-[860px] mx-auto flex-1 flex flex-col justify-center py-10 px-6 md:px-10">
        {/* Brand name */}
        <p className="text-sm font-semibold text-purple-300/80 tracking-widest uppercase mb-4">Personal Account Upgrades</p>

        {/* Headline */}
        <h1 className="font-rajdhani text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
          <span className="text-white">Elevate Every </span>
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
            Subscription
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base text-white mb-10 max-w-[600px] mx-auto leading-relaxed">
          Upgrade your personal accounts with premium subscriptions at a lowered cost
        </p>

        {/* CTA */}
        <div className="flex justify-center mb-10">
          <Link
            href="/products"
            className="relative z-20 inline-flex items-center gap-2.5 text-white px-9 py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(249,115,22,0.3)]"
            style={{ background: "linear-gradient(to right, #f97316 2%, #f43f5e 50%, #9333ea 98%)" }}
          >
            <Lock className="w-5 h-5" />
            Upgrade now
          </Link>
        </div>

        {/* Stats pills */}
        <div className="relative z-20 flex gap-3 justify-center flex-wrap mb-8">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path d="M2 12L5 5L8 8L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold text-white">{productsSold}</span>
            <span className="text-sm text-gray-400">Products Sold</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 backdrop-blur-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-semibold text-white">{feedbacks}</span>
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
            <span>4 to 5 day delivery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Response within 24h</span>
          </div>
        </div>
      </div>

      {/* Trust Bar — pinned to bottom */}
      <div className="relative z-20 w-full border-y border-white/[0.12] bg-[#0c0a18]/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 grid grid-cols-2 gap-4 lg:flex lg:items-center lg:justify-between lg:py-7">
          {trustItems.map(({ icon: Icon, value, label, highlight }, i) => (
            <div key={label} className="flex items-center lg:flex-row">
              {i > 0 && (
                <div className="hidden lg:block w-px h-12 bg-white/[0.1] mr-8" />
              )}
              <div className="flex items-center gap-3 py-1 lg:gap-3.5 lg:py-2">
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 shrink-0 ${highlight ? "text-emerald-400" : "text-gray-400"}`} />
                <div className="text-left">
                  <p className={`text-sm lg:text-base font-bold leading-tight ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</p>
                  <p className="text-xs lg:text-sm text-gray-500 leading-tight">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
