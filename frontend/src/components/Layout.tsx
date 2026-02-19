import { ReactNode } from "react";
import { useAuthStore } from "../store/auth";

interface LayoutProps {
  title?: string;
  children: ReactNode;
}

export function Layout({ title, children }: LayoutProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen px-6 py-10 text-ink md:px-10">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-brand/80">ApprovalHub</p>
          <h1 className="text-4xl font-semibold text-ink">{title}</h1>
          <p className="text-sm text-slate">Precision approvals with a modern command center.</p>
        </div>
        {user && (
          <div className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 shadow-soft backdrop-blur">
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate">{user.role}</p>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
