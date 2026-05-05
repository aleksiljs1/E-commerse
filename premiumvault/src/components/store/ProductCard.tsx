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
  const soldOut = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soldOut) return;
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
      className={`relative bg-[#16221B] border border-[#1F8A5B]/25 rounded-2xl cursor-pointer flex flex-col overflow-hidden transition-all duration-200 ${
        soldOut
          ? "opacity-75 hover:opacity-90"
          : "hover:-translate-y-1 hover:border-[#1F8A5B]/70 hover:shadow-[0_0_24px_rgba(31,138,91,0.15)]"
      }`}
    >
      {/* Sold Out tag */}
      {soldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Glow behind tag */}
            <div className="absolute inset-0 blur-xl bg-black/60 rounded-2xl" />
            <span className="relative inline-flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-white/10 text-white text-sm font-bold tracking-widest uppercase px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Sold Out
            </span>
          </div>
        </div>
      )}

      {/* Featured badge */}
      {product.featured && !soldOut && (
        <span className="absolute top-3 left-3 z-10 bg-[#1F8A5B]/20 border border-[#1F8A5B]/40 text-[#2ECC71] text-xs font-semibold px-2.5 py-1 rounded-full">
          Featured
        </span>
      )}

      {/* Image area */}
      <div className={`aspect-square w-full overflow-hidden bg-[#0F1412] ${soldOut ? "grayscale" : ""}`}>
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
        <p className={`font-rajdhani text-2xl font-bold mb-3 ${soldOut ? "text-[#A0B5A8]" : "text-[#2ECC71]"}`}>
          £{product.price.toFixed(2)}
        </p>
      </div>

      {/* Button */}
      <div className="px-4 pb-4">
        {soldOut ? (
          <div className="w-full py-2.5 bg-[#0F1412] border border-white/10 text-[#A0B5A8] text-sm font-semibold rounded-xl text-center cursor-not-allowed">
            Unavailable
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="cursor-pointer w-full py-2.5 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
