"use client";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  PAID: { label: "Paid", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  CREDENTIALS_SUBMITTED: { label: "Credentials In", className: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  COMPLETED: { label: "Completed", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  CANCELLED: { label: "Cancelled", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

type Props = { status: string };

export function StatusBadge({ status }: Props) {
  const cfg =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
      label: status,
      className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
