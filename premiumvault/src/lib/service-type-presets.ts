export const SERVICE_TYPE_PRESETS = [
  { slug: "spotify",    label: "Spotify",     color: "#1DB954" },
  { slug: "netflix",    label: "Netflix",     color: "#E50914" },
  { slug: "youtube",    label: "YouTube",     color: "#FF0000" },
  { slug: "disney",     label: "Disney+",     color: "#1B3A6B" },
  { slug: "applemusic", label: "Apple Music", color: "#FC3C44" },
  { slug: "hulu",       label: "Hulu",        color: "#1CE783" },
  { slug: "streaming",  label: "Streaming",   color: "#DC2626" },
  { slug: "vpn",        label: "VPN",         color: "#3B82F6" },
  { slug: "ai_tools",   label: "AI Tools",    color: "#14B8A6" },
  { slug: "gaming",     label: "Gaming",      color: "#9333EA" },
  { slug: "music",      label: "Music",       color: "#22C55E" },
  { slug: "education",  label: "Education",   color: "#EAB308" },
  { slug: "editing",    label: "Editing",     color: "#EC4899" },
];

/** Returns white or black depending on bg luminance */
export function contrastColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? "#000000" : "#ffffff";
}
