import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-4 shadow-soft backdrop-blur">
      <div className="mb-3">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {subtitle && <p className="text-xs text-slate">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
