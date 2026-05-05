"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { QuantityControl } from "@/components/store/QuantityControl";

type Props = {
  price: number;
  productId: string;
  title: string;
  description: string;
  logoUrl: string | null;
  serviceType: string;
  stock: number;
};

export function ProductActions({ price, productId, title, description, logoUrl, serviceType, stock }: Props) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ productId, title, description, price, logoUrl, serviceType });
    }
    openCart();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ productId, title, description, price, logoUrl, serviceType });
    }
    router.push("/checkout");
  };

  const isOutOfStock = stock <= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[#A0B5A8] text-sm">Qty:</span>
        <QuantityControl
          value={quantity}
          onIncrement={() => setQuantity((q) => Math.min(q + 1, stock))}
          onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
          min={1}
          max={stock}
        />
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="cursor-pointer w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] text-white disabled:opacity-50 rounded-xl py-3 font-semibold transition-colors"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className="cursor-pointer w-full border border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71]/10 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
      >
        Buy Now
      </button>
    </div>
  );
}
