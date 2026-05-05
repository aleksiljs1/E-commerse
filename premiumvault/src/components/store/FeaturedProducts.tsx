"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Layers, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { SerializedProduct } from "@/types";

type Props = { products: SerializedProduct[] };

function FeaturedCard({ product }: { product: SerializedProduct }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="
        group relative flex-shrink-0 cursor-pointer
        w-[220px] sm:w-auto
        bg-gradient-to-b from-[#1a2e21] to-[#16221B]
        border border-[#1F8A5B]/30
        rounded-3xl overflow-hidden
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        hover:shadow-[0_16px_48px_rgba(31,138,91,0.25)]
        hover:-translate-y-2
        transition-all duration-300
      "
    >
      {/* Glow ring on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 1px rgba(46,204,113,0.4)" }} />

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-[#0d1a11]">
        {product.logoUrl ? (
          <Image
            src={product.logoUrl}
            alt={product.title}
            width={350}
            height={350}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers className="w-12 h-12 text-[#1F8A5B]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-[#E8F5EE] font-semibold text-sm leading-snug mb-1 line-clamp-2">{product.title}</p>
        <p className="font-rajdhani text-xl font-bold text-[#2ECC71]">£{product.price.toFixed(2)}</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            addItem({
              productId: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
              logoUrl: product.logoUrl,
              serviceType: product.serviceType,
            });
          }}
          className="mt-3 w-full py-2 bg-[#1F8A5B]/20 hover:bg-[#2ECC71] border border-[#1F8A5B]/40 hover:border-[#2ECC71] text-[#2ECC71] hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export function FeaturedProducts({ products }: Props) {
  const featured = products.filter((p) => p.featured);
  if (featured.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#1F8A5B] font-semibold mb-2">Top Picks</p>
            <h2 className="font-rajdhani text-3xl md:text-4xl font-bold text-[#E8F5EE]">
              Featured Services
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-[#2ECC71] hover:text-[#27AE60] transition-colors text-sm font-medium shrink-0"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile: horizontal scroll carousel */}
      <div className="md:hidden px-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-4" style={{ width: "max-content" }}>
          {featured.map((product) => (
            <div key={product.id} style={{ scrollSnapAlign: "start" }}>
              <FeaturedCard product={product} />
            </div>
          ))}
          {/* Trailing spacer so last card doesn't hug the edge */}
          <div className="w-2 shrink-0" />
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:block max-w-[1200px] mx-auto px-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featured.map((product) => (
            <FeaturedCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Mobile: View all link */}
      <div className="md:hidden px-6 mt-6">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-[#2ECC71] hover:text-[#27AE60] transition-colors text-sm font-medium"
        >
          View all services <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
