"use client";

import { useState } from "react";

const categories = ["Stream", "AI Tools", "VPN", "Gaming", "TV", "Sports", "EDU", "Editing", "Keys"];

export function CategoryTabs() {
  const [active, setActive] = useState("Stream");

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex gap-2.5 overflow-x-auto border-b border-[#1F8A5B]/20 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-medium whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
            active === cat
              ? "bg-[#1F8A5B]/20 border-[#1F8A5B] text-[#2ECC71]"
              : "bg-transparent border-[#1F8A5B]/25 text-[#A0B5A8] hover:border-[#1F8A5B]/50 hover:text-[#E8F5EE]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
