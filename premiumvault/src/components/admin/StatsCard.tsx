export function StatsCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div
      className={`bg-[#16221B] rounded-2xl p-6 border ${
        highlight ? "border-[#1F8A5B]" : "border-[#1F8A5B]/30"
      }`}
    >
      <p className="text-sm text-[#A0B5A8]">{label}</p>
      <p className="text-3xl font-bold text-[#E8F5EE] mt-2">{value}</p>
    </div>
  );
}
