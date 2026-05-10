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
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.1] last:border-0">
      {/* Left: icon */}
      <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />

      {/* Middle: details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-gray-400/70 truncate mt-0.5">{item.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          £{item.price.toFixed(2)} · Total: £{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <QuantityControl
          value={item.quantity}
          onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
          onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
          max={item.stock}
        />
        <button
          onClick={() => removeItem(item.productId)}
          className="cursor-pointer p-1 text-gray-400/70 hover:text-red-400 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
