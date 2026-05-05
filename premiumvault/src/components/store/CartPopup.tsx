"use client";

import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItem";
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
        className="fixed inset-0 z-40 bg-black/60"
        onClick={closeCart}
      />

      {/* Popup box */}
      <div className="fixed top-16 right-4 z-50 w-[380px] max-h-[72vh] bg-[#0d0d18] border border-[#1e1e2e] rounded-2xl shadow-2xl shadow-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e]">
          <h2 className="text-base font-semibold text-white">Your Basket</h2>
          <button
            onClick={closeCart}
            className="text-[#a1a1aa] hover:text-white transition-colors"
            aria-label="Close basket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#a1a1aa]">
              <span className="text-3xl mb-2">🛒</span>
              <p className="text-sm">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#1e1e2e] px-5 py-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#a1a1aa]">Subtotal</span>
              <span className="text-white font-bold text-base">£{subtotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
