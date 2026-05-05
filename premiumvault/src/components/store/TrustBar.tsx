const trustItems = [
  { icon: "⚡", title: "Fast Delivery", desc: "Instant account delivery after payment" },
  { icon: "🛡️", title: "Warranty Included", desc: "Full replacement guarantee on all accounts" },
  { icon: "🔒", title: "Secure Payment", desc: "Encrypted transactions & multiple methods" },
  { icon: "💬", title: "24/7 Support", desc: "Round-the-clock customer assistance" },
];

export function TrustBar() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-5 md:px-10 py-10 max-w-[1200px] mx-auto">
      {trustItems.map((item) => (
        <div
          key={item.title}
          className="bg-[#141420] border border-[#1e1e2e] rounded-2xl py-7 px-5 text-center transition-all hover:border-purple-600 hover:-translate-y-1"
        >
          <div className="text-4xl mb-3">{item.icon}</div>
          <div className="text-base font-semibold text-white mb-1">{item.title}</div>
          <div className="text-xs text-[#a1a1aa]">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
