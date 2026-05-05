"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <section className="bg-zinc-950 w-full">
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center text-center gap-6">
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
          Elevate Every Account.
        </h1>

        {/* Subheading */}
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Premium upgrades for Spotify, Netflix, YouTube and more — delivered in 4–5 days.
        </p>

        {/* CTA button */}
        <Link
          href="/products"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-colors"
        >
          Browse Products →
        </Link>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-2 text-sm text-zinc-400">
          <span>🔒 Secure</span>
          <span>⚡ Fast</span>
          <span>✅ Guaranteed</span>
        </div>
      </div>
    </section>
  );
}
