interface StatusBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const styleMap = {
  PENDING: "bg-amber-100/80 text-amber-800 border border-amber-200",
  APPROVED: "bg-emerald-100/80 text-emerald-800 border border-emerald-200",
  REJECTED: "bg-rose-100/80 text-rose-800 border border-rose-200"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styleMap[status]}`}>
      {status}
    </span>
  );
}
