import { getActiveProducts } from "@/lib/products";
import { HeroSection } from "@/components/store/HeroSection";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const [products, statsSettings] = await Promise.all([
    getActiveProducts(),
    prisma.siteSetting.findMany({
      where: { key: { in: ["stats_products_sold", "stats_feedbacks"] } },
    }),
  ]);

  const statsMap = new Map(statsSettings.map((s) => [s.key, s.value]));
  const productsSold = statsMap.get("stats_products_sold") || "298";
  const feedbacks = statsMap.get("stats_feedbacks") || "34";

  return (
    <>
      <HeroSection productsSold={productsSold} feedbacks={feedbacks} />

      <FeaturedProducts products={products} />

      <section id="how-it-works" className="py-20 px-4 border-y border-white/[0.08]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                title: "Choose your service",
                desc: "Browse Spotify, Netflix, YouTube and more. Add to cart and check out securely.",
              },
              {
                n: "02",
                title: "Pay securely",
                desc: "Pay via Stripe or PayPal. Your order is confirmed instantly after payment.",
              },
              {
                n: "03",
                title: "We upgrade your account",
                desc: "Submit your account credentials. We handle the upgrade and confirm when it's done — typically 4–5 business days.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                <p className="text-[11px] font-mono text-white/[0.2] uppercase tracking-widest mb-4">{n}</p>
                <h3 className="font-medium text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
