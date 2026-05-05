"use client";

import Link from "next/link";
import type { SerializedProduct } from "@/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: SerializedProduct[];
};

export function FeaturedProducts({ products }: Props) {
  const featured = products.filter((p) => p.featured === true);

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Featured Services</h2>

      {featured.length === 0 ? (
        <p className="text-zinc-500 text-sm">No featured products at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/products"
          className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
        >
          Browse all services →
        </Link>
      </div>
    </section>
  );
}
