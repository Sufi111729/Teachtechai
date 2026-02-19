interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-soft backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-slate">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate">{helper}</p>}
    </div>
  );
}
