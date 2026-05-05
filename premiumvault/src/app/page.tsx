import { getActiveProducts } from "@/lib/products";
import { HeroSection } from "@/components/store/HeroSection";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";
import { ShieldCheck, Zap, BadgeCheck } from "lucide-react";

export default async function HomePage() {
  const products = await getActiveProducts();

  return (
    <>
      <Navbar />
      <CartPopup />
      <main className="pt-16 bg-[#0F1412] text-[#E8F5EE] min-h-screen">
        <HeroSection />

        <FeaturedProducts products={products} />

        <section id="how-it-works" className="py-20 px-4 border-y border-[#1F8A5B]/20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-[#E8F5EE] mb-10">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-[#1F8A5B]/20">
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
                <div key={n} className="md:px-8 first:pl-0 last:pr-0 py-6 md:py-0 border-b border-[#1F8A5B]/20 md:border-0 last:border-0">
                  <p className="text-[11px] font-mono text-[#1F8A5B]/60 uppercase tracking-widest mb-4">{n}</p>
                  <h3 className="font-medium text-[#E8F5EE] mb-2">{title}</h3>
                  <p className="text-[#A0B5A8] text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-10">Why PremiumVault?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  Icon: ShieldCheck,
                  title: "Secure",
                  desc: "All transactions protected with 256-bit SSL. Credentials never stored in plain text.",
                },
                {
                  Icon: Zap,
                  title: "Fast turnaround",
                  desc: "Most upgrades completed within 4–5 business days. Our team works around the clock.",
                },
                {
                  Icon: BadgeCheck,
                  title: "Guaranteed",
                  desc: "If your upgrade fails for any reason, we guarantee a full refund — no questions asked.",
                },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-xl border border-[#1F8A5B]/20 bg-[#16221B] p-6 flex flex-col gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0F1412] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#6ED3A3]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#E8F5EE] mb-1.5">{title}</h3>
                    <p className="text-[#A0B5A8] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
