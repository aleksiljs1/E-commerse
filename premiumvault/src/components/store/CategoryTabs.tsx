"use client";

import { useState } from "react";

const categories = ["Stream", "AI Tools", "VPN", "Gaming", "TV", "Sports", "EDU", "Editing", "Keys"];

export function CategoryTabs() {
  const [active, setActive] = useState("Stream");

  return (
    <div className="px-5 md:px-10 py-5 flex gap-2.5 overflow-x-auto border-b border-[#1e1e2e] scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-medium whitespace-nowrap transition-all border cursor-pointer ${
            active === cat
              ? "bg-purple-600 border-purple-600 text-white"
              : "bg-[#141420] border-[#1e1e2e] text-[#a1a1aa] hover:border-purple-600 hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
