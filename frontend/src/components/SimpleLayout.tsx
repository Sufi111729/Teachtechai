import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

interface SimpleLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SimpleLayout({ title, subtitle, children }: SimpleLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen px-6 py-10 text-ink md:px-10">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-brand/80">ApprovalHub</p>
          <h1 className="text-3xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-slate">{subtitle}</p>}
        </div>
        {user && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 shadow-soft backdrop-blur">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate">{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
