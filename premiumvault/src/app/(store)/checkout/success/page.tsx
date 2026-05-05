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
    <div className="min-h-screen bg-[#0F1412] text-[#E8F5EE] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-[#E8F5EE]">Payment Successful!</h1>
        <p className="text-[#A0B5A8]">Check your email — we&apos;ve sent you a secure link to submit your account credentials.</p>
        {orderId && <p className="text-sm text-[#A0B5A8]/70 font-mono">Order: {orderId}</p>}
        <Link
          href="/"
          className="inline-block border border-[#1F8A5B]/30 text-[#E8F5EE] hover:bg-[#1F8A5B]/10 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
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
