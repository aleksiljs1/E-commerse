import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/store/HeroSection";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";
import type { SerializedProduct } from "@/types";

export default async function HomePage() {
  const raw = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  const products: SerializedProduct[] = raw.map((p) => ({ ...p, price: Number(p.price) }));

  return (
    <>
      <Navbar />
      <CartPopup />
      <main className="pt-16 bg-zinc-950 text-white min-h-screen">
        <HeroSection />

        <FeaturedProducts products={products} />

        <section id="how-it-works" className="py-16 px-4 bg-zinc-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: 1, title: "Choose your service", desc: "Browse products and add to cart" },
                { n: 2, title: "Secure checkout", desc: "Pay via Stripe or PayPal" },
                { n: 3, title: "Submit credentials", desc: "We upgrade your account in 4–5 days" },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {n}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-zinc-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">Why PremiumVault?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🔒", title: "Secure", desc: "All transactions protected with 256-bit SSL. Credentials never stored in plain text." },
                { icon: "⚡", title: "Fast", desc: "Most upgrades completed within 4–5 business days. Our team works around the clock." },
                { icon: "✅", title: "Reliable", desc: "If your upgrade fails for any reason, we guarantee a full refund — no questions asked." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center text-center gap-3">
                  <span className="text-3xl">{icon}</span>
                  <h3 className="font-semibold text-white text-lg">{title}</h3>
                  <p className="text-zinc-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
