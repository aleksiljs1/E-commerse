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
        <span className="text-[#a1a1aa] text-sm">Qty:</span>
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
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className="w-full bg-transparent border border-[#1e1e2e] hover:border-purple-600/50 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
      >
        Buy Now
      </button>
    </div>
  );
}
