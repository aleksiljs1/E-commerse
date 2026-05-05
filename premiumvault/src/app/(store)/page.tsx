import { prisma } from "@/lib/db";
import type { SerializedProduct } from "@/types";
import { HeroSection } from "@/components/store/HeroSection";
import { CategoryTabs } from "@/components/store/CategoryTabs";
import { TrustBar } from "@/components/store/TrustBar";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ReviewsSection } from "@/components/store/ReviewsSection";
import { Footer } from "@/components/store/Footer";

export default async function StoreHomePage() {
  let products: SerializedProduct[] = [];

  try {
    const raw = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 8,
    });
    products = raw.map((p) => ({ ...p, price: Number(p.price) }));
  } catch {
    // DB not available — fallback products will be shown
  }

  return (
    <>
      <CategoryTabs />
      <HeroSection />
      <TrustBar />
      <ProductGrid products={products} />
      <ReviewsSection />
      <Footer />
    </>
  );
}
