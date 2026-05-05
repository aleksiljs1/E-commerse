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
    <div className="min-h-screen bg-[#0F1412] text-[#E8F5EE] px-4 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#E8F5EE] mb-8">All Services</h1>
      <ProductGrid products={products} />
    </div>
  );
}
