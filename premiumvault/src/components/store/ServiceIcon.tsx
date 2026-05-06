"use client";

import Image from "next/image";

const SERVICE_CONFIG: Record<string, { label: string; bg: string; text: string; initial: string }> = {
  spotify: { label: "Spotify", bg: "bg-green-500", text: "text-white", initial: "S" },
  netflix: { label: "Netflix", bg: "bg-red-600", text: "text-white", initial: "N" },
  youtube: { label: "YouTube", bg: "bg-red-500", text: "text-white", initial: "YT" },
  disney: { label: "Disney+", bg: "bg-blue-700", text: "text-white", initial: "D+" },
  applemusic: { label: "Apple Music", bg: "bg-pink-600", text: "text-white", initial: "AM" },
  hulu: { label: "Hulu", bg: "bg-green-400", text: "text-black", initial: "H" },
  streaming: { label: "Streaming", bg: "bg-red-600", text: "text-white", initial: "▶" },
  vpn: { label: "VPN", bg: "bg-blue-500", text: "text-white", initial: "🛡" },
  ai_tools: { label: "AI Tools", bg: "bg-teal-500", text: "text-white", initial: "🤖" },
  gaming: { label: "Gaming", bg: "bg-purple-600", text: "text-white", initial: "🎮" },
  music: { label: "Music", bg: "bg-green-500", text: "text-white", initial: "♪" },
  education: { label: "Education", bg: "bg-yellow-500", text: "text-black", initial: "📚" },
  editing: { label: "Editing", bg: "bg-pink-500", text: "text-white", initial: "🎨" },
  default: { label: "Service", bg: "bg-zinc-700", text: "text-white", initial: "?" },
};

type Props = {
  serviceType: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export function ServiceIcon({ serviceType, logoUrl, size = "md" }: Props) {
  const config = SERVICE_CONFIG[serviceType.toLowerCase()] ?? SERVICE_CONFIG.default;
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-12 h-12 text-sm", lg: "w-20 h-20 text-xl" };
  const sizePx = { sm: 32, md: 48, lg: 80 };

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={config.label}
        width={sizePx[size]}
        height={sizePx[size]}
        unoptimized
        className={`${sizeClasses[size]} object-contain rounded-xl`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${config.bg} ${config.text} rounded-xl flex items-center justify-center font-bold`}
    >
      {config.initial}
    </div>
  );
}
