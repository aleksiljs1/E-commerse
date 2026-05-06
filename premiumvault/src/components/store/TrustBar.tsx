"use client";

import { ClipboardList, Lock, Headphones, Star } from "lucide-react";

const items = [
  { icon: ClipboardList, value: "9,083+", label: "Orders Delivered" },
  { icon: Lock, value: "Secure", label: "Payment Protection" },
  { icon: Headphones, value: "24h", label: "Support Response" },
  { icon: Star, value: "Trustpilot", label: "Verified Reviews", highlight: true },
];

export function TrustBar() {
  return (
    <section className="relative z-30 w-full border-y border-white/[0.1] bg-[#0c0a18]/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex flex-wrap items-center justify-between">
        {items.map(({ icon: Icon, value, label, highlight }, i) => (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div className="hidden lg:block w-px h-10 bg-white/[0.1] mr-8" />
            )}
            <div className="flex items-center gap-3 py-2">
              <Icon className={`w-5 h-5 shrink-0 ${highlight ? "text-emerald-400" : "text-gray-400"}`} />
              <div>
                <p className={`text-sm font-bold leading-tight ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</p>
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
