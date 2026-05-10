"use client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Layers, Pencil } from "lucide-react";
import type { SerializedProduct } from "@/types";
import Image from "next/image";
import { useSession } from "next-auth/react";

type Props = { product: SerializedProduct };

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const soldOut = product.stock <= 0 && product.productType !== "DROPSHIP";

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
      stock: product.stock,
    });
  };

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      style={{ touchAction: "manipulation" }}
      className={`relative bg-white/[0.04] border border-white/[0.08] rounded-2xl cursor-pointer flex flex-col overflow-hidden transition-all duration-200 ${
        soldOut
          ? "opacity-75 hover:opacity-90"
          : "hover:-translate-y-1 hover:border-white/[0.2] hover:shadow-[0_0_24px_rgba(255,255,255,0.05)]"
      }`}
    >
      {/* Admin edit button */}
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/admin/dashboard/products/${product.id}/edit`); }}
          className="cursor-pointer absolute top-2 right-2 z-30 w-8 h-8 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all"
          title="Edit product"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

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
        <span className="absolute top-3 left-3 z-10 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          Featured
        </span>
      )}

      {/* Image area */}
      <div className={`aspect-square w-full overflow-hidden bg-black/30 ${soldOut ? "grayscale" : ""}`}>
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
            <Layers className="w-10 h-10 text-gray-600" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-base font-semibold text-white leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{product.title}</p>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2rem]" dangerouslySetInnerHTML={{ __html: product.description.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
        <p className="text-xs text-orange-400 mb-2 min-h-[1rem]">
          {product.productType !== "DROPSHIP" && product.stock < 5 && product.stock > 0 ? `Only ${product.stock} left` : "\u00A0"}
        </p>
        <p className={`font-rajdhani text-2xl font-bold mb-3 ${soldOut ? "text-gray-400" : "text-orange-400"}`}>
          £{product.price.toFixed(2)}
        </p>
      </div>

      {/* Button */}
      <div className="px-4 pb-4">
        {soldOut ? (
          <div className="w-full py-2.5 bg-black/30 border border-white/10 text-gray-400 text-sm font-semibold rounded-xl text-center cursor-not-allowed">
            Unavailable
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            style={{ touchAction: "manipulation" }}
            className="cursor-pointer w-full py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 text-white text-sm font-semibold rounded-xl transition-opacity"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
