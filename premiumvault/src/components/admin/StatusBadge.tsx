"use client";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", dot: "bg-yellow-400", bg: "bg-yellow-500/10 text-yellow-400" },
  PAID: { label: "Paid", dot: "bg-blue-400", bg: "bg-blue-500/10 text-blue-400" },
  CREDENTIALS_SUBMITTED: { label: "Credentials In", dot: "bg-purple-400", bg: "bg-purple-500/10 text-purple-400" },
  COMPLETED: { label: "Completed", dot: "bg-green-400", bg: "bg-green-500/10 text-green-400" },
  CANCELLED: { label: "Cancelled", dot: "bg-red-400", bg: "bg-red-500/10 text-red-400" },
};

type Props = { status: string };

export function StatusBadge({ status }: Props) {
  const cfg =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
      label: status,
      dot: "bg-zinc-400",
      bg: "bg-zinc-500/10 text-zinc-400",
    };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
