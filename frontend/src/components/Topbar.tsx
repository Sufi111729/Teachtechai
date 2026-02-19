import { Bell, ChevronDown, Search, Menu } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { useState } from "react";

interface TopbarProps {
  title: string;
  onMenu: () => void;
  notifications?: Array<{ id: number; label: string; timestamp: string }>;
  pendingCount?: number;
}

export function Topbar({ title, onMenu, notifications = [], pendingCount = 0 }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-xl border border-white/70 bg-white/70 p-2 text-ink lg:hidden">
          <Menu size={18} />
        </button>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <div className="hidden w-64 items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-slate md:flex">
          <Search size={16} />
          <input className="w-full outline-none" placeholder="Search anything" />
        </div>
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative rounded-2xl border border-white/70 bg-white/70 p-2 text-ink"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <button onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.25em] text-slate">
                  Close
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {notifications.length === 0 && (
                  <p className="text-xs text-slate">No new approvals.</p>
                )}
                {notifications.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                    <p className="text-xs font-semibold text-ink">{item.label}</p>
                    <p className="text-[11px] text-slate">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
            {user?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
          <span className="hidden text-ink md:block">{user?.name || "Admin"}</span>
          <ChevronDown size={16} className="text-slate" />
        </div>
        <button
          onClick={logout}
          className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-ink"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
