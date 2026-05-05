"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { OrderSummary } from "@/components/store/OrderSummary";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
    }
  }, [items, router]);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top logo bar — no nav */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <span className="text-xl font-bold">PremiumVault</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-10">
          {/* Left: Order Summary */}
          <OrderSummary items={items} subtotal={subtotal()} />

          {/* Center: Vertical Divider */}
          <div className="hidden lg:block bg-zinc-800" />

          {/* Right: Checkout Form */}
          <CheckoutForm items={items} />
        </div>
      </main>
    </div>
  );
}
