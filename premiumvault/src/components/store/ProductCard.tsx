"use client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Layers } from "lucide-react";
import type { SerializedProduct } from "@/types";
import Image from "next/image";

type Props = { product: SerializedProduct };

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

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
      onClick={() => router.push(`/products/${product.id}`)}
      className="relative bg-[#16221B] border border-[#1F8A5B]/25 rounded-2xl cursor-pointer flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#1F8A5B]/70 hover:shadow-[0_0_24px_rgba(31,138,91,0.15)]"
    >
      {/* Featured badge — absolute, doesn't affect layout */}
      {product.featured && (
        <span className="absolute top-3 left-3 z-10 bg-[#1F8A5B]/20 border border-[#1F8A5B]/40 text-[#2ECC71] text-xs font-semibold px-2.5 py-1 rounded-full">
          Featured
        </span>
      )}

      {/* Image area — square, fills full width */}
      <div className="aspect-square w-full overflow-hidden bg-[#0F1412]">
        {product.logoUrl ? (
          <Image
            src={product.logoUrl}
            alt={product.title}
            width={500}
            height={500}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-10 h-10 text-[#1F8A5B]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-base font-semibold text-[#E8F5EE] leading-snug mb-1">{product.title}</p>
        <p className="text-xs text-[#A0B5A8] line-clamp-2 mb-3 flex-1">{product.description}</p>
        {product.stock < 5 && product.stock > 0 && (
          <p className="text-xs text-orange-400 mb-2">Only {product.stock} left</p>
        )}
        <p className="font-rajdhani text-2xl font-bold text-[#2ECC71] mb-3">£{product.price.toFixed(2)}</p>
      </div>

      {/* Button — outside content padding, spans full width minus margin */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          className="cursor-pointer w-full py-2.5 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
