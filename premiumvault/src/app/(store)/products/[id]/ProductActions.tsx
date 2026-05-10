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
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({ productId, title, description, price, logoUrl, serviceType, stock }, quantity);
  };

  const handleBuyNow = () => {
    addItem({ productId, title, description, price, logoUrl, serviceType, stock }, quantity);
    router.push("/checkout");
  };

  const isOutOfStock = stock <= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Qty:</span>
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
        className="cursor-pointer w-full bg-gradient-to-r from-orange-400 to-rose-500 hover:from-rose-500 hover:to-orange-400 text-white disabled:opacity-50 rounded-xl py-3 font-semibold transition-colors"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className="cursor-pointer w-full border border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-xl py-3 font-semibold transition-colors disabled:opacity-50"
      >
        Buy Now
      </button>
    </div>
  );
}
