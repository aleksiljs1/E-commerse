import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ProductsPageClient } from "@/components/store/ProductsPageClient";
import type { SerializedProduct } from "@/types";

async function ProductsContent() {
  const [rawProducts, serviceTypes] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.serviceType.findMany({ orderBy: { label: "asc" } }),
  ]);

  const products: SerializedProduct[] = rawProducts.map((p) => ({ ...p, price: Number(p.price) }));

  return <ProductsPageClient products={products} serviceTypes={serviceTypes} />;
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-12">
        <div className="mb-8">
          <h1 className="font-rajdhani text-4xl font-bold text-white">All Services</h1>
          <p className="text-gray-400 text-sm mt-1">Browse all available premium subscriptions</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /></div>}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
