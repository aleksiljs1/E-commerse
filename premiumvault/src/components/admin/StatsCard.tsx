type Props = { label: string; value: string | number; highlight?: boolean };

export function StatsCard({ label, value, highlight }: Props) {
  return (
    <div
      className={`bg-zinc-900 rounded-2xl p-6 border ${
        highlight ? "border-indigo-500" : "border-zinc-800"
      }`}
    >
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  );
}
