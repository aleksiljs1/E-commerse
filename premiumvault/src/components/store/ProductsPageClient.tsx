"use client";

import { useState, useMemo } from "react";
import { ProductGrid } from "./ProductGrid";
import type { SerializedProduct } from "@/types";

type ServiceTypeInfo = { slug: string; label: string; color: string };

type Props = {
  products: SerializedProduct[];
  serviceTypes: ServiceTypeInfo[];
};

export function ProductsPageClient({ products, serviceTypes }: Props) {
  const [active, setActive] = useState<string>("all");

  // Only show tabs for service types that have at least one active product
  const presentSlugs = useMemo(
    () => new Set(products.map((p) => p.serviceType.toLowerCase())),
    [products],
  );
  const tabs = useMemo(
    () => serviceTypes.filter((t) => presentSlugs.has(t.slug)),
    [serviceTypes, presentSlugs],
  );

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.serviceType.toLowerCase() === active)),
    [products, active],
  );

  return (
    <>
      {/* Filter tabs */}
      {tabs.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setActive("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer shrink-0 ${
              active === "all"
                ? "bg-white text-black"
                : "bg-white/[0.07] text-gray-300 hover:bg-white/[0.12]"
            }`}
          >
            All
          </button>
          {tabs.map((t) => (
            <button
              key={t.slug}
              onClick={() => setActive(t.slug)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border shrink-0 whitespace-nowrap"
              style={
                active === t.slug
                  ? { background: t.color, color: "#fff", borderColor: t.color }
                  : { background: t.color + "18", color: t.color, borderColor: t.color + "44" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <ProductGrid products={filtered} />
    </>
  );
}
