"use client";
import { ServiceIcon } from "./ServiceIcon";
import type { CartItem } from "@/types";

type Props = { items: CartItem[]; subtotal: number };

export function OrderSummary({ items, subtotal }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#E8F5EE]">Order Summary</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3">
            <ServiceIcon serviceType={item.serviceType} logoUrl={item.logoUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#E8F5EE] truncate">{item.quantity}× {item.title}</p>
            </div>
            <p className="text-sm font-medium text-[#E8F5EE] shrink-0">£{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-[#1F8A5B]/30 pt-4 flex justify-between">
        <span className="font-bold text-[#E8F5EE]">Total</span>
        <span className="font-bold text-[#E8F5EE] text-lg">£{subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
