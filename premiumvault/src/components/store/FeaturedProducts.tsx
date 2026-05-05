"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Layers, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { SerializedProduct } from "@/types";

type Props = { products: SerializedProduct[] };

// Gradient backgrounds per service type
const SERVICE_GRADIENTS: Record<string, string> = {
  spotify:    "from-[#1DB954]/30 via-[#0a1a0f] to-[#0d1a11]",
  netflix:    "from-[#E50914]/30 via-[#1a0a0d] to-[#0d1010]",
  youtube:    "from-[#FF0000]/25 via-[#1a0a0a] to-[#0d1010]",
  disney:     "from-[#113CCF]/30 via-[#0a0f1a] to-[#0d1118]",
  applemusic: "from-[#FC3C44]/25 via-[#1a0a0f] to-[#0d1010]",
  hulu:       "from-[#1CE783]/25 via-[#0a1a0f] to-[#0d1410]",
  default:    "from-[#1F8A5B]/25 via-[#0d1a11] to-[#0d1410]",
};

function getGradient(serviceType: string) {
  return SERVICE_GRADIENTS[serviceType] ?? SERVICE_GRADIENTS.default;
}

export function FeaturedProducts({ products }: Props) {
  const featured = products.filter((p) => p.featured);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (featured.length === 0) return null;

  const prev = () => setActive((i) => (i - 1 + featured.length) % featured.length);
  const next = () => setActive((i) => (i + 1) % featured.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#1F8A5B] font-semibold mb-2">Top Picks</p>
            <h2 className="font-rajdhani text-3xl md:text-4xl font-bold text-[#E8F5EE]">
              Featured Services
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-[#2ECC71] hover:text-[#27AE60] transition-colors text-sm font-medium"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="relative flex items-center justify-center"
        style={{ perspective: "1200px", height: "420px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {featured.map((product, i) => {
          const offset = i - active;
          // Only render visible cards (-2 to +2)
          if (Math.abs(offset) > 2) return null;

          const isActive = offset === 0;
          const isAdjacent = Math.abs(offset) === 1;
          const isFar = Math.abs(offset) === 2;

          const scale = isActive ? 1 : isAdjacent ? 0.78 : 0.62;
          const translateX = offset * 58; // % of some unit
          const opacity = isActive ? 1 : isAdjacent ? 0.55 : 0.25;
          const zIndex = isActive ? 30 : isAdjacent ? 20 : 10;
          const blur = isActive ? 0 : isAdjacent ? 0 : 2;
          const gradient = getGradient(product.serviceType);

          return (
            <div
              key={product.id}
              onClick={() => isActive ? null : setActive(i)}
              style={{
                position: "absolute",
                width: "260px",
                transform: `translateX(${translateX * 1.8}px) scale(${scale})`,
                opacity,
                zIndex,
                filter: blur > 0 ? `blur(${blur}px)` : "none",
                transition: "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                cursor: isActive ? "default" : "pointer",
              }}
            >
              <div
                className={`
                  relative rounded-3xl overflow-hidden
                  bg-gradient-to-b ${gradient}
                  border border-[#1F8A5B]/25
                  ${isActive ? "shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_40px_rgba(31,138,91,0.2)]" : "shadow-[0_8px_24px_rgba(0,0,0,0.5)]"}
                `}
              >
                {/* Card inner */}
                <div className="p-6 flex flex-col items-center text-center" style={{ minHeight: "340px" }}>

                  {/* Logo / Icon */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 mt-2 flex items-center justify-center bg-black/20 border border-white/10">
                    {product.logoUrl ? (
                      <Image
                        src={product.logoUrl}
                        alt={product.title}
                        width={96}
                        height={96}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="w-10 h-10 text-[#2ECC71]" />
                    )}
                  </div>

                  {/* Title */}
                  <p className="text-[#E8F5EE] font-semibold text-sm leading-snug line-clamp-2 mb-2">
                    {product.title}
                  </p>

                  {/* Price */}
                  <p className="font-rajdhani text-3xl font-bold text-[#2ECC71] mb-2">
                    £{product.price.toFixed(2)}
                  </p>

                  {/* Delivery */}
                  <div className="flex items-center gap-1.5 text-[#A0B5A8] text-xs mb-5">
                    <Clock className="w-3 h-3" />
                    4–5 Day Delivery
                  </div>

                  {/* CTA — only on active card */}
                  {isActive && (
                    <div className="flex flex-col gap-2 w-full mt-auto">
                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            productId: product.id,
                            title: product.title,
                            description: product.description,
                            price: product.price,
                            logoUrl: product.logoUrl,
                            serviceType: product.serviceType,
                          });
                        }}
                        className="w-full py-3 bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] text-white font-semibold text-sm rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(46,204,113,0.4)] flex items-center justify-center gap-2"
                      >
                        Purchase Now <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="w-full py-2 text-[#A0B5A8] hover:text-[#E8F5EE] text-xs transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full bg-[#16221B] border border-[#1F8A5B]/30 hover:border-[#1F8A5B] text-[#A0B5A8] hover:text-[#2ECC71] flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(31,138,91,0.3)]"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 h-2 bg-[#2ECC71]"
                  : "w-2 h-2 bg-[#1F8A5B]/30 hover:bg-[#1F8A5B]/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full bg-[#16221B] border border-[#1F8A5B]/30 hover:border-[#1F8A5B] text-[#A0B5A8] hover:text-[#2ECC71] flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(31,138,91,0.3)]"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile: View all */}
      <div className="sm:hidden px-6 mt-8 flex justify-center">
        <Link
          href="/products"
          className="flex items-center gap-1.5 text-[#2ECC71] text-sm font-medium"
        >
          View all services <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
