"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./CartItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export function CartSheet() {
  const { isOpen, closeCart, items, subtotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] bg-[#0F1412] border-[#1F8A5B]/30 flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-4 border-b border-[#1F8A5B]/30">
          <SheetTitle className="text-[#E8F5EE] text-lg font-semibold">Your Basket</SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <ShoppingBag className="w-12 h-12 text-[#A0B5A8]/50" />
              <p className="text-[#A0B5A8]/70 text-sm">Your basket is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1F8A5B]/30">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-[#1F8A5B]/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#A0B5A8] text-sm">Subtotal</span>
              <span className="text-[#E8F5EE] font-bold text-lg">£{subtotal().toFixed(2)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] text-white" size="lg">
              Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
