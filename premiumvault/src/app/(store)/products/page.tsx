import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { SerializedProduct } from "@/types";

export default async function ProductsPage() {
  const raw = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  const products: SerializedProduct[] = raw.map((p) => ({ ...p, price: Number(p.price) }));

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12">
        <div className="mb-8">
          <h1 className="font-rajdhani text-3xl md:text-4xl font-bold text-white">All Services</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Browse all available premium subscriptions</p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
