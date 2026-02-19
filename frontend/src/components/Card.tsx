import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-soft backdrop-blur">
      {title && <h3 className="text-xl font-semibold text-ink">{title}</h3>}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}
