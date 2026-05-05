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
    <div className="min-h-screen bg-[#0F1412] text-[#E8F5EE]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-[#E8F5EE]">All Services</h1>
          <p className="text-[#A0B5A8] text-sm mt-1">Browse all available premium subscriptions</p>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
