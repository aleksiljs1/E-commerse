"use client";

import { useState } from "react";

const categories = ["Stream", "AI Tools", "VPN", "Gaming", "TV", "Sports", "EDU", "Editing", "Keys"];

export function CategoryTabs() {
  const [active, setActive] = useState("Stream");

  return (
    <div className="px-5 md:px-10 py-5 flex gap-2.5 overflow-x-auto border-b border-zinc-800 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-medium whitespace-nowrap transition-all border cursor-pointer ${
            active === cat
              ? "bg-[#2ECC71] border-[#2ECC71] text-white"
              : "bg-[#16221B] border-zinc-800 text-[#A0B5A8] hover:border-[#1F8A5B] hover:text-[#7DFFB2]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
