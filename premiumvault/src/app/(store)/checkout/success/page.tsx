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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
        <p className="text-gray-400">Check your email — we&apos;ve sent you a secure link to submit your account credentials.</p>
        {orderId && <p className="text-sm text-gray-400/70 font-mono">Order: {orderId}</p>}
        <Link
          href="/"
          className="inline-block border border-white/[0.08] text-white hover:bg-white/[0.05] rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}><SuccessContent /></Suspense>;
}
