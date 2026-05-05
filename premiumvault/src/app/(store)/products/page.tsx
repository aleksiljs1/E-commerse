import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/store/ProductGrid";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">All Services</h1>
      <ProductGrid products={products} />
    </div>
  );
}
