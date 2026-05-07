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
        className="fixed inset-0 z-[1001] bg-black/60"
        onClick={closeCart}
        style={{ touchAction: "manipulation" }}
      />

      {/* Popup box */}
      <div className="fixed z-[1002] bg-[#141220] border border-white/[0.1] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl md:inset-x-auto md:bottom-auto md:top-16 md:right-4 md:w-[380px] md:max-h-[70vh] md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.1]">
          <h2 className="text-base font-semibold text-white">Your Basket</h2>
          <button
            onClick={closeCart}
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            aria-label="Close basket"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400/70">
              <span className="text-3xl mb-2">🛒</span>
              <p className="text-sm">Your basket is empty</p>
            </div>
          ) : (
            items.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/[0.1] px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-bold text-base">£{subtotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="cursor-pointer w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-rose-500 hover:to-orange-400 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
