export function StatsCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`bg-[#0d0d18] border rounded-2xl p-6 ${highlight ? "border-purple-600/50" : "border-[#1e1e2e]"}`}>
      <p className="text-[#a1a1aa] text-sm font-medium mb-2">{label}</p>
      <p className={`font-rajdhani text-3xl font-bold ${highlight ? "text-purple-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
