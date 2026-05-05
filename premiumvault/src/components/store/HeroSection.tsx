import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 md:py-20 px-5 md:px-10 text-center max-w-[900px] mx-auto">
      <h1 className="font-rajdhani text-4xl md:text-[3.5rem] leading-tight mb-5 bg-gradient-to-br from-[#E8F5EE] to-[#6ED3A3] bg-clip-text text-transparent">
        Premium Accounts & Digital Subscriptions
      </h1>
      <p className="text-lg text-[#A0B5A8] mb-9 max-w-[600px] mx-auto">
        Get premium digital account upgrades with lifetime warranty, fast 4–5 day delivery, and 24/7 customer support. Save up to 70% on all subscriptions.
      </p>
      <div className="flex gap-4 justify-center mb-14 flex-wrap">
        <Link
          href="/products"
          className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(46,204,113,0.4)]"
        >
          Shop Now
        </Link>
        <Link
          href="/#products"
          className="bg-transparent text-[#2ECC71] px-8 py-3.5 rounded-xl font-semibold text-base border border-[#2ECC71] transition-all hover:border-[#7DFFB2] hover:shadow-[0_0_15px_rgba(31,138,91,0.4)] hover:-translate-y-0.5"
        >
          Browse Categories
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
            <div className="font-rajdhani text-3xl font-bold text-[#2ECC71]">{stat.value}</div>
            <div className="text-sm text-[#A0B5A8] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
