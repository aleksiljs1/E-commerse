"use client";

import Image from "next/image";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { contrastColor } from "@/lib/service-type-presets";

const FALLBACK_INITIALS: Record<string, string> = {
  spotify: "S", netflix: "N", youtube: "YT", disney: "D+", applemusic: "AM",
  hulu: "H", streaming: "▶", vpn: "🛡", ai_tools: "🤖", gaming: "🎮",
  music: "♪", education: "📚", editing: "🎨",
};

type Props = {
  serviceType: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export function ServiceIcon({ serviceType, logoUrl, size = "md" }: Props) {
  const types = useServiceTypes();
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-20 h-20 text-xl" };
  const sizePx = { sm: 32, md: 48, lg: 80 };

  const key = serviceType.toLowerCase();
  const matched = types.find((t) => t.slug === key);
  const color = matched?.color ?? "#52525b";
  const label = matched?.label ?? serviceType;
  const initial = FALLBACK_INITIALS[key] ?? serviceType.slice(0, 2).toUpperCase();

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={label}
        width={sizePx[size]}
        height={sizePx[size]}
        unoptimized
        className={`${sizeClasses[size]} object-contain rounded-xl`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold`}
      style={{ background: color, color: contrastColor(color) }}
    >
      {initial}
    </div>
  );
}
