"use client";

import type { SerializedProduct } from "@/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: SerializedProduct[];
};

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-[#a1a1aa] text-sm">No products available at the moment.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
