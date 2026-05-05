import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 md:py-20 px-5 md:px-10 text-center max-w-[900px] mx-auto">
      <h1 className="font-rajdhani text-4xl md:text-[3.5rem] leading-tight mb-5 bg-gradient-to-br from-white to-purple-400 bg-clip-text text-transparent">
        Premium Accounts & Digital Subscriptions
      </h1>
      <p className="text-lg text-[#a1a1aa] mb-9 max-w-[600px] mx-auto">
        Get instant access to premium digital accounts with lifetime warranty, instant delivery, and 24/7 customer support. Save up to 70% on all subscriptions.
      </p>
      <div className="flex gap-4 justify-center mb-14 flex-wrap">
        <Link
          href="/products"
          className="bg-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:bg-purple-700 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)]"
        >
          Shop Now
        </Link>
        <Link
          href="/products"
          className="bg-transparent text-white px-8 py-3.5 rounded-xl font-semibold text-base border border-[#1e1e2e] transition-all hover:border-purple-600 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
        >
          View Deals
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: "10K+", label: "Customers" },
          { value: "50K+", label: "Orders" },
          { value: "4.9", label: "Rating" },
          { value: "24/7", label: "Support" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-rajdhani text-3xl font-bold text-purple-600">{stat.value}</div>
            <div className="text-sm text-[#a1a1aa] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
