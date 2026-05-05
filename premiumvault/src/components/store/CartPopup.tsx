"use client";

import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CartPopup() {
  const { isOpen, closeCart, items, subtotal } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeCart]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeCart}
      />

      {/* Popup box */}
      <div className="fixed top-16 right-4 z-50 w-[380px] max-h-[70vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">Your Basket</h2>
          <button
            onClick={closeCart}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close basket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
              <span className="text-3xl mb-2">🛒</span>
              <p className="text-sm">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-white font-bold text-base">£{subtotal().toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 hover:bg-indigo-500"
              size="lg"
            >
              Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
