import { prisma } from "@/lib/db";
import type { SerializedProduct } from "@/types";
import { HeroSection } from "@/components/store/HeroSection";
import { TrustBar } from "@/components/store/TrustBar";
import { StoreSection } from "@/components/store/StoreSection";
import { ReviewsSection } from "@/components/store/ReviewsSection";
import { Footer } from "@/components/store/Footer";

export default async function StoreHomePage() {
  let products: SerializedProduct[] = [];

  try {
    const raw = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    products = raw.map((p) => ({ ...p, price: Number(p.price) }));
  } catch {
    // DB not available — fallback products will be shown
  }

  return (
    <>
      <HeroSection />
      <TrustBar />
      <StoreSection products={products} />
      <ReviewsSection />
      <Footer />
    </>
  );
}
