export function StatsCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white/[0.04] border rounded-xl p-4 md:p-5 ${
        highlight ? "border-orange-400 border-l-[3px]" : "border-white/[0.1]"
      }`}
    >
      <p className="text-gray-400 text-[10px] md:text-[11px] font-medium uppercase tracking-widest mb-2 md:mb-3">
        {label}
      </p>
      <p className="font-rajdhani text-2xl md:text-4xl font-bold text-white leading-none break-all">{value}</p>
    </div>
  );
}
