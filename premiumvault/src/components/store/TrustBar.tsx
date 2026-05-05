const trustItems = [
  { icon: "⚡", title: "Fast Delivery", desc: "Upgrade delivered within 4–5 business days" },
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
          className="bg-[#16221B] border border-zinc-800 rounded-2xl py-7 px-5 text-center transition-all hover:border-[#1F8A5B] hover:-translate-y-1"
        >
          <div className="text-4xl mb-3">{item.icon}</div>
          <div className="text-base font-semibold text-[#E8F5EE] mb-1">{item.title}</div>
          <div className="text-xs text-[#A0B5A8]">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
