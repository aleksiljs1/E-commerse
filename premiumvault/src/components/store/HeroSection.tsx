"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 w-full">
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center text-center gap-6">
        {/* Overline */}
        <p className="text-xs uppercase tracking-widest text-indigo-400">
          Premium Account Upgrades
        </p>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
          Elevate Every Subscription.
        </h1>

        {/* Subheading */}
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Upgrade to premium on Spotify, Netflix, YouTube and more — instantly,
          securely, and at the best price.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            <Link href="/products">Browse Products</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800 px-8"
          >
            <Link href="#how-it-works">How It Works</Link>
          </Button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-6">
          <span className="text-sm text-zinc-400">🔒 Secure Checkout</span>
          <span className="text-sm text-zinc-400">✅ 4–5 Day Upgrade</span>
          <span className="text-sm text-zinc-400">💬 24/7 Support</span>
        </div>
      </div>
    </section>
  );
}
