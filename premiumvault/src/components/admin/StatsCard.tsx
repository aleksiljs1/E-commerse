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
      className={`bg-[#16221B] border rounded-xl p-5 ${
        highlight ? "border-[#1F8A5B] border-l-[3px]" : "border-[#1F8A5B]/30"
      }`}
    >
      <p className="text-[#A0B5A8] text-[11px] font-medium uppercase tracking-widest mb-3">
        {label}
      </p>
      <p className="font-rajdhani text-4xl font-bold text-[#E8F5EE] leading-none">{value}</p>
    </div>
  );
}
