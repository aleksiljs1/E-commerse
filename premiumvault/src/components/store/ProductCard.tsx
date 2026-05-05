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
      className="bg-[#0d0d18] border border-[#1e1e2e] rounded-2xl hover:border-purple-600/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all cursor-pointer flex flex-col overflow-hidden group"
    >
      {/* Icon area */}
      <div className="flex items-center justify-center py-10 px-6 bg-[#141420]">
        <ServiceIcon
          serviceType={product.serviceType}
          logoUrl={product.logoUrl}
          size="lg"
        />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold text-white leading-snug">{product.title}</p>
        <p className="text-purple-400 font-bold text-lg">£{product.price.toFixed(2)}</p>

        {product.stock < 5 && (
          <p className="text-orange-400 text-xs font-medium">
            Only {product.stock} left
          </p>
        )}

        {product.featured && (
          <span className="inline-block w-fit bg-purple-600/20 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-600/30">
            Featured
          </span>
        )}

        <div className="flex-1" />
      </div>

      {/* Footer */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
