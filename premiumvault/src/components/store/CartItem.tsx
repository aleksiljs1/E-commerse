"use client";

import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { ServiceIcon } from "./ServiceIcon";
import { QuantityControl } from "./QuantityControl";
import type { CartItem as CartItemType } from "@/types";

type Props = {
  item: CartItemType;
};

export function CartItemRow({ item }: Props) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1e1e2e] last:border-0">
      {/* Left: icon */}
      <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />

      {/* Middle: details */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{item.title}</p>
        {item.description && (
          <p className="text-[#52525b] text-xs truncate">{item.description}</p>
        )}
        <p className="text-purple-400 text-xs font-medium">
          £{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <QuantityControl
          value={item.quantity}
          onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
          onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
        />
        <button
          onClick={() => removeItem(item.productId)}
          className="text-[#52525b] hover:text-red-400 transition-colors p-1"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
