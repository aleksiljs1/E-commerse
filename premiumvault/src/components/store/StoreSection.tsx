"use client";

import { useState } from "react";
import { ProductGrid } from "./ProductGrid";
import type { SerializedProduct } from "@/types";

const CATEGORIES = ["All", "Stream", "AI Tools", "VPN", "Gaming", "TV", "Sports", "EDU", "Editing", "Keys"];

const CATEGORY_MAP: Record<string, string[]> = {
  Stream: ["spotify", "netflix", "youtube", "disney", "applemusic", "hulu", "prime", "peacock", "hbo", "paramount", "tidal", "deezer", "crunchyroll", "stream"],
  "AI Tools": ["openai", "chatgpt", "claude", "midjourney", "ai", "gpt"],
  VPN: ["vpn", "nordvpn", "expressvpn", "surfshark"],
  Gaming: ["gaming", "xbox", "playstation", "steam", "ea", "game"],
  TV: ["iptv", "television", "tv"],
  Sports: ["sport", "dazn", "espn", "nba", "nfl"],
  EDU: ["edu", "duolingo", "coursera", "udemy", "skillshare", "linkedin", "learn"],
  Editing: ["adobe", "canva", "figma", "davinci", "edit"],
  Keys: ["key", "license", "windows", "office", "microsoft"],
};

export function StoreSection({ products }: { products: SerializedProduct[] }) {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All"
      ? products
      : products.filter((p) => {
          const keywords = CATEGORY_MAP[active] ?? [];
          return keywords.some((kw) => p.serviceType.toLowerCase().includes(kw));
        });

  return (
    <section id="products" className="max-w-[1200px] mx-auto px-5 md:px-10 py-10">
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide mb-8 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-[0.85rem] font-medium whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
              active === cat
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-[#141420] border-[#1e1e2e] text-[#a1a1aa] hover:border-purple-600 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-white font-semibold text-lg">No services in this category yet</p>
          <p className="text-[#a1a1aa] text-sm">Check back soon or browse everything we have.</p>
          <button
            onClick={() => setActive("All")}
            className="text-purple-400 text-sm hover:text-purple-300 transition-colors mt-1"
          >
            View all services →
          </button>
        </div>
      ) : (
        <ProductGrid products={filtered} />
      )}
    </section>
  );
}
