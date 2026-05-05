"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { ServiceIcon } from "./ServiceIcon";
import type { SerializedProduct } from "@/types";

type Props = {
  product: SerializedProduct;
};

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      logoUrl: product.logoUrl,
      serviceType: product.serviceType,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="rounded-2xl border border-[#1F8A5B]/30 bg-[#16221B] hover:border-[#1F8A5B] transition-all cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Featured badge */}
      {product.featured && (
        <div className="px-4 pt-3 flex justify-end">
          <span className="bg-[#2ECC71] text-white text-xs px-2 py-0.5 rounded-full">
            Featured
          </span>
        </div>
      )}

      {/* Top — icon */}
      <div className="flex items-center justify-center py-8 px-4">
        <ServiceIcon
          serviceType={product.serviceType}
          logoUrl={product.logoUrl}
          size="lg"
        />
      </div>

      {/* Title */}
      <p className="font-semibold text-[#E8F5EE] text-sm text-center px-4 pb-1">
        {product.title}
      </p>

      {/* Price */}
      <p className="text-[#6ED3A3] font-bold text-lg text-center pb-2">
        £{product.price.toFixed(2)}
      </p>

      {product.stock < 5 && (
        <p className="text-orange-400 text-xs font-medium text-center pb-2">
          Only {product.stock} left
        </p>
      )}

      <div className="flex-1" />

      {/* Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:opacity-90 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
