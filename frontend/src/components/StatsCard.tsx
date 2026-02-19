import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend: string;
  icon: ReactNode;
  tone?: "pending" | "success" | "neutral";
}

const toneStyles = {
  pending: "from-amber-50 to-white text-amber-700",
  success: "from-emerald-50 to-white text-emerald-700",
  neutral: "from-sky-50 to-white text-brand"
};

export function StatsCard({ label, value, trend, icon, tone = "neutral" }: StatsCardProps) {
  return (
    <div className="group rounded-3xl border border-white/80 bg-gradient-to-br px-5 py-4 shadow-soft transition hover:-translate-y-1">
      <div className={`mb-4 inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 px-3 py-2 ${toneStyles[tone]}`}>
        {icon}
      </div>
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="text-xs uppercase tracking-[0.3em] text-slate">{label}</p>
      <p className="mt-2 text-xs text-success">{trend}</p>
    </div>
  );
}
