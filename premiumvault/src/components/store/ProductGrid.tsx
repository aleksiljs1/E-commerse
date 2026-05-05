import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

type Props = { products: SerializedProduct[] };

export function ProductGrid({ products }: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20 text-[#A0B5A8]">
        <p className="text-lg">No products available right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
