import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

type Props = { products: SerializedProduct[]; carousel?: boolean };

export function ProductGrid({ products, carousel = false }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No products available right now.</p>
      </div>
    );
  }

  if (carousel) {
    return (
      <>
        {/* Mobile: horizontal snap scroll */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-6 px-6 sm:hidden">
          {products.map((p) => (
            <div key={p.id} className="snap-center shrink-0 w-[75vw] max-w-[300px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
