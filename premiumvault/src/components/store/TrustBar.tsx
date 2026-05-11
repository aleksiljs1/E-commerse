import { ClipboardList, Lock, Headphones, Star } from "lucide-react";

type Props = {
  productsSold?: string;
};

export function TrustBar({ productsSold = "298" }: Props) {
  const items = [
    { icon: ClipboardList, value: `${productsSold}+`, label: "Orders Delivered" },
    { icon: Lock, value: "Secure", label: "Payment Protection" },
    { icon: Headphones, value: "24h", label: "Support Response" },
    { icon: Star, value: "Trustpilot", label: "Verified Reviews", highlight: true as const },
  ];
  return (
    <section className="relative z-20 w-full border-y border-white/[0.12] bg-[#0c0a18]/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-7 flex flex-wrap items-center justify-between">
        {items.map(({ icon: Icon, value, label, highlight }, i) => (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div className="hidden lg:block w-px h-12 bg-white/[0.1] mr-8" />
            )}
            <div className="flex items-center gap-3.5 py-2">
              <Icon className={`w-6 h-6 shrink-0 ${highlight ? "text-emerald-400" : "text-gray-400"}`} />
              <div>
                <p className={`text-base font-bold leading-tight ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</p>
                <p className="text-sm text-gray-500 leading-tight">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
