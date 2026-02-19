import { NavLink } from "react-router-dom";
import { useState } from "react";
import { BarChart3, Bell, Brain, FileText, LayoutDashboard, LogOut, Moon, Settings, ShieldCheck, Users } from "lucide-react";
import { useAuthStore } from "../store/auth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Approvals", icon: ShieldCheck, path: "/admin/approvals" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Documents", icon: FileText, path: "/admin/documents" },
  { label: "AI Analytics", icon: Brain, path: "/admin/ai-analytics" },
  { label: "Activity Logs", icon: Bell, path: "/admin/activity" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Settings", icon: Settings, path: "/admin/settings" }
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed z-50 h-full w-72 border-r border-white/70 bg-white/80 px-6 py-6 shadow-soft backdrop-blur transition lg:static lg:z-auto lg:h-auto lg:w-full lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-brand/80">ApprovalHub</p>
          <h2 className="text-2xl font-semibold text-ink">Admin Control</h2>
          <p className="text-xs text-slate">Command, review, and ship approvals.</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-brand text-white shadow-sm" : "text-slate hover:bg-white/70"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/70 bg-white/60 px-4 py-4">
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-semibold text-ink"
          >
            Dark Mode
            <Moon size={16} className={darkMode ? "text-brand" : "text-slate"} />
          </button>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-ink"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
    </>
  );
}
