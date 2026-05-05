"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="bg-[#0d0d18] border border-[#1e1e2e] rounded-2xl p-10 max-w-md w-full text-center space-y-4">
        {/* Check circle */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <span className="text-2xl text-green-400">✓</span>
          </div>
        </div>

        <h1 className="font-rajdhani text-3xl font-bold text-white">Payment Successful!</h1>

        <p className="text-[#a1a1aa]">
          Check your email — we&apos;ve sent you a link to submit your account credentials.
        </p>

        {orderId && (
          <p className="text-[#52525b] text-sm font-mono">Order: {orderId}</p>
        )}

        <Link
          href="/"
          className="border border-[#1e1e2e] hover:border-purple-600 text-white rounded-xl px-6 py-2.5 inline-block text-sm font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
