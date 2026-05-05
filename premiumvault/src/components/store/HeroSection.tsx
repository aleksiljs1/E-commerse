import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 px-6 md:px-10 text-center">
      {/* Radial green glow behind headline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 800px 400px at 50% 0%, rgba(31,138,91,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[860px] mx-auto">
        {/* Overline */}
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1F8A5B] border border-[#1F8A5B]/30 bg-[#1F8A5B]/10 rounded-full px-4 py-1.5 mb-6">
          Premium Account Upgrades
        </span>

        {/* Headline */}
        <h1 className="font-rajdhani text-5xl md:text-6xl font-bold leading-tight mb-5 bg-gradient-to-br from-[#E8F5EE] to-[#6ED3A3] bg-clip-text text-transparent">
          Premium Accounts &amp;<br className="hidden md:block" /> Digital Subscriptions
        </h1>

        {/* Subtext */}
        <p className="text-lg text-[#A0B5A8] mb-10 max-w-[560px] mx-auto leading-relaxed">
          Get instant access to premium digital accounts with lifetime warranty, instant delivery, and 24/7 customer support.
        </p>

        {/* CTAs */}
        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(46,204,113,0.3)]"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-[#1F8A5B]/40 text-[#A0B5A8] hover:text-[#E8F5EE] hover:border-[#1F8A5B] px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
          >
            How It Works
          </Link>
        </div>

        {/* Stats panel */}
        <div className="bg-[#16221B] border border-[#1F8A5B]/20 rounded-2xl py-6 px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "10K+", label: "Happy Customers" },
            { value: "50K+", label: "Orders Fulfilled" },
            { value: "4.9★", label: "Average Rating" },
            { value: "24/7", label: "Customer Support" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-rajdhani text-2xl font-bold text-[#2ECC71]">{value}</p>
              <p className="text-xs text-[#A0B5A8] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
