"use client";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  PAID: { label: "Paid", className: "bg-[#1F8A5B]/20 text-[#6ED3A3] border-[#1F8A5B]/30" },
  CREDENTIALS_SUBMITTED: { label: "Credentials In", className: "bg-[#1F8A5B]/10 text-[#7DFFB2] border-[#1F8A5B]/30" },
  COMPLETED: { label: "Completed", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/20 text-red-400 border-red-500/30" },
};

type Props = { status: string };

export function StatusBadge({ status }: Props) {
  const cfg =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
      label: status,
      className: "bg-[#16221B] text-[#A0B5A8] border-[#1F8A5B]/30",
    };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
