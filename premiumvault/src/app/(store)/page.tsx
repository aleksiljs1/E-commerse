import { prisma } from "@/lib/db";
import { HeroSection } from "@/components/store/HeroSection";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";

export default async function StorePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* Hero */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts products={products} />

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Choose your service</h3>
              <p className="text-zinc-400 text-sm">Browse products and add to cart</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Secure checkout</h3>
              <p className="text-zinc-400 text-sm">Pay via Stripe or PayPal</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Submit credentials</h3>
              <p className="text-zinc-400 text-sm">We upgrade your account in 4–5 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why PremiumVault */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">Why PremiumVault?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center text-center gap-3">
              <span className="text-3xl">🔒</span>
              <h3 className="font-semibold text-white text-lg">Secure</h3>
              <p className="text-zinc-400 text-sm">
                All transactions are protected with 256-bit SSL encryption. Your credentials are never stored in plain text.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center text-center gap-3">
              <span className="text-3xl">⚡</span>
              <h3 className="font-semibold text-white text-lg">Fast</h3>
              <p className="text-zinc-400 text-sm">
                Most upgrades are completed within 4–5 business days. Our team works around the clock.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center text-center gap-3">
              <span className="text-3xl">✅</span>
              <h3 className="font-semibold text-white text-lg">Reliable</h3>
              <p className="text-zinc-400 text-sm">
                If your upgrade fails for any reason, we guarantee a full refund — no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
