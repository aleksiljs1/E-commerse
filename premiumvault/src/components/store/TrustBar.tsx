import { Zap, Shield, Lock, MessageCircle } from "lucide-react";

const items = [
  { icon: Zap, label: "Instant Delivery", desc: "Accounts activated within minutes" },
  { icon: Shield, label: "Lifetime Warranty", desc: "Full replacement if any issues arise" },
  { icon: Lock, label: "Secure Payment", desc: "256-bit SSL encryption on all orders" },
  { icon: MessageCircle, label: "24/7 Support", desc: "Always here when you need us" },
];

export function TrustBar() {
  return (
    <section className="py-10 px-6 md:px-10">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="bg-[#16221B] border border-[#1F8A5B]/20 rounded-2xl p-4 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1F8A5B]/10 border border-[#1F8A5B]/20 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#2ECC71]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#E8F5EE]">{label}</p>
              <p className="text-xs text-[#A0B5A8] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
