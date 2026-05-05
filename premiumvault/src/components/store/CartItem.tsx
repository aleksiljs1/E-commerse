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
    <div className="flex items-start gap-3 py-3">
      <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">£{(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <QuantityControl
          value={item.quantity}
          onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
          onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
        />
        <button
          onClick={() => removeItem(item.productId)}
          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
