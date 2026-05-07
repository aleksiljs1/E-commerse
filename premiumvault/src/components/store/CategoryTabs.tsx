"use client";

import { useState } from "react";

const categories = ["Stream", "AI Tools", "VPN", "Gaming", "TV", "Sports", "EDU", "Editing", "Keys"];

interface CategoryTabsProps {
  onCategoryChange?: (category: string) => void;
}

export function CategoryTabs({ onCategoryChange }: CategoryTabsProps) {
  const [active, setActive] = useState("Stream");

  const handleClick = (cat: string) => {
    setActive(cat);
    onCategoryChange?.(cat);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex gap-2.5 overflow-x-auto border-b border-white/[0.1] scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleClick(cat)}
          className={`px-5 py-2 rounded-full text-[0.85rem] font-medium whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
            active === cat
              ? "bg-orange-400/20 border-orange-400 text-orange-400"
              : "bg-transparent border-white/[0.1] text-gray-400 hover:border-white/[0.2] hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
