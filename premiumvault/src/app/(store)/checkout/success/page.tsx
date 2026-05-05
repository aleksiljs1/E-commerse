"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { useCartStore } from "@/store/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">Payment Successful!</h1>
        <p className="text-zinc-400">Check your email — we&apos;ve sent you a secure link to submit your account credentials.</p>
        {orderId && <p className="text-sm text-zinc-500 font-mono">Order: {orderId}</p>}
        <Link href="/"><Button variant="outline" className="border-zinc-700">Return to Home</Button></Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
