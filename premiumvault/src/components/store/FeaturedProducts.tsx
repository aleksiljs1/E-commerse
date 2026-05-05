"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Layers, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { SerializedProduct } from "@/types";

type Props = { products: SerializedProduct[] };

const SERVICE_GRADIENTS: Record<string, string> = {
  spotify:    "from-[#1DB954]/30 via-[#0a1a0f] to-[#0d1a11]",
  netflix:    "from-[#E50914]/30 via-[#1a0a0d] to-[#0d1010]",
  youtube:    "from-[#FF0000]/25 via-[#1a0a0a] to-[#0d1010]",
  disney:     "from-[#113CCF]/30 via-[#0a0f1a] to-[#0d1118]",
  applemusic: "from-[#FC3C44]/25 via-[#1a0a0f] to-[#0d1010]",
  hulu:       "from-[#1CE783]/25 via-[#0a1a0f] to-[#0d1410]",
  default:    "from-[#1F8A5B]/25 via-[#0d1a11] to-[#0d1410]",
};

function getGradient(s: string) {
  return SERVICE_GRADIENTS[s] ?? SERVICE_GRADIENTS.default;
}

export function FeaturedProducts({ products }: Props) {
  const featured = products.filter((p) => p.featured);
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  if (featured.length === 0) return null;

  const spreadPx = typeof window !== "undefined" && window.innerWidth >= 768 ? 290 : 190;

  const getInterval = () =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 4000 : 6000;

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!isPaused.current) setActive((i) => (i + 1) % featured.length);
    }, getInterval());
  }, [featured.length]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (pauseTimer.current) clearTimeout(pauseTimer.current);
    };
  }, [startAutoplay]);

  // Non-passive touchmove on document so e.preventDefault() works during drag
  useEffect(() => {
    const onMove = (e: TouchEvent) => {
      if (isHorizontalDrag.current === true) e.preventDefault();
    };
    document.addEventListener("touchmove", onMove, { passive: false });
    return () => document.removeEventListener("touchmove", onMove);
  }, []);

  const pauseAndResume = useCallback(() => {
    isPaused.current = true;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => { isPaused.current = false; }, 6000);
  }, []);

  const prev = () => { setActive((i) => (i - 1 + featured.length) % featured.length); pauseAndResume(); };
  const next = () => { setActive((i) => (i + 1) % featured.length); pauseAndResume(); };

  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalDrag = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalDrag.current = null;
    isPaused.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Decide once on first meaningful movement
    if (isHorizontalDrag.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontalDrag.current = Math.abs(dx) > Math.abs(dy);
    }

    // Only drag cards if horizontal — let vertical scroll pass through
    if (!isHorizontalDrag.current) return;
    e.preventDefault();
    isDragging.current = true;

    const resistance = 0.4;
    const atStart = active === 0 && dx > 0;
    const atEnd = active === featured.length - 1 && dx < 0;
    setDragOffset(atStart || atEnd ? dx * resistance : dx);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;

    if (isDragging.current && Math.abs(dx) > spreadPx * 0.25) {
      dx < 0 ? next() : prev();
    }

    setDragOffset(0);
    isDragging.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalDrag.current = null;
    pauseAndResume();
  };

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
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
        ref={carouselRef}
        className="relative flex items-center justify-center select-none"
        style={{ perspective: "1200px", height: "420px" }}
      >
        {featured.map((product, i) => {
          const offset = i - active;
          if (Math.abs(offset) > 2) return null;

          const isActive = offset === 0;
          const isAdjacent = Math.abs(offset) === 1;

          const scale = isActive ? 1 : isAdjacent ? 0.78 : 0.62;
          const opacity = isActive ? 1 : isAdjacent ? 0.55 : 0.25;
          const zIndex = isActive ? 30 : isAdjacent ? 20 : 10;
          const blur = Math.abs(offset) === 2 ? 2 : 0;
          const gradient = getGradient(product.serviceType);

          // Real-time drag offset only applied on mobile (touch)
          const tx = offset * spreadPx + (isDragging.current ? dragOffset : 0);

          return (
            <div
              key={product.id}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                if (isDragging.current) return;
                if (isActive) router.push(`/products/${product.id}`);
                else { setActive(i); pauseAndResume(); }
              }}
              style={{
                position: "absolute",
                width: isActive ? "clamp(260px, 22vw, 320px)" : "clamp(220px, 18vw, 280px)",
                transform: `translateX(${tx}px) scale(${scale})`,
                opacity,
                zIndex,
                filter: blur > 0 ? `blur(${blur}px)` : "none",
                // No transition while dragging — instant follow
                transition: isDragging.current ? "none" : "all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                cursor: isActive ? "pointer" : "pointer",
              }}
            >
              <div
                className={`
                  relative rounded-3xl overflow-hidden
                  bg-gradient-to-b ${gradient}
                  border border-[#1F8A5B]/25
                  ${isActive
                    ? "shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_40px_rgba(31,138,91,0.2)]"
                    : "shadow-[0_8px_24px_rgba(0,0,0,0.5)]"}
                `}
              >
                <div className="p-6 flex flex-col items-center text-center" style={{ minHeight: "340px" }}>

                  {/* Logo */}
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
                  <div className="flex items-center gap-1.5 text-[#A0B5A8] text-xs">
                    <Clock className="w-3 h-3" />
                    4–5 Day Delivery
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* View button — fades in when active, fades out otherwise */}
                  <div
                    style={{
                      opacity: isActive ? 1 : 0,
                      transition: "opacity 0.4s ease",
                      pointerEvents: isActive ? "auto" : "none",
                      paddingBottom: "8px",
                      width: "100%",
                    }}
                  >
                    <span className="inline-block w-full text-center text-sm font-semibold text-white bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#2ECC71] rounded-xl px-6 py-3 transition-all duration-200 shadow-[0_4px_16px_rgba(46,204,113,0.25)]">
                      View
                    </span>
                  </div>

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
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); pauseAndResume(); }}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-6 h-2 bg-[#2ECC71]" : "w-2 h-2 bg-[#1F8A5B]/30 hover:bg-[#1F8A5B]/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full bg-[#16221B] border border-[#1F8A5B]/30 hover:border-[#1F8A5B] text-[#A0B5A8] hover:text-[#2ECC71] flex items-center justify-center transition-all hover:shadow-[0_0_12px_rgba(31,138,91,0.3)]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="sm:hidden px-6 mt-8 flex justify-center">
        <Link href="/products" className="flex items-center gap-1.5 text-[#2ECC71] text-sm font-medium">
          View all services <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
