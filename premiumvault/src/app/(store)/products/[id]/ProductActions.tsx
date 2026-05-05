"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { QuantityControl } from "@/components/store/QuantityControl";
import { Button } from "@/components/ui/button";

type Props = {
  price: number;
  productId: string;
  title: string;
  logoUrl: string | null;
  serviceType: string;
  stock: number;
};

export function ProductActions({ price, productId, title, logoUrl, serviceType, stock }: Props) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ productId, title, price, logoUrl, serviceType });
    }
    openCart();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ productId, title, price, logoUrl, serviceType });
    }
    router.push("/checkout");
  };

  const isOutOfStock = stock <= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 text-sm">Qty:</span>
        <QuantityControl
          value={quantity}
          onIncrement={() => setQuantity((q) => Math.min(q + 1, stock))}
          onDecrement={() => setQuantity((q) => Math.max(q - 1, 1))}
          min={1}
          max={stock}
        />
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        size="lg"
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </Button>

      <Button
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        variant="outline"
        className="w-full border-zinc-700 text-white hover:bg-zinc-800"
        size="lg"
      >
        Buy Now
      </Button>
    </div>
  );
}
