import { Layout } from "../components/Layout";
import { useAuthStore } from "../store/auth";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";

export function PendingApprovalPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <Layout title="Approval Pending">
      <div className="max-w-3xl rounded-3xl border border-white/80 bg-white/80 p-8 shadow-soft backdrop-blur animate-rise">
        <p className="text-xs uppercase tracking-[0.35em] text-brand/80">ApprovalHub</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">Your account is awaiting approval</h2>
        <p className="mt-3 text-sm text-slate">
          Admin or assigned teacher will review your account. You will get access once approved.
        </p>
        {user && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-slate">{user.email}</p>
            </div>
            <StatusBadge status={user.status} />
          </div>
        )}
        <div className="mt-6">
          <Link to="/login" className="text-brand text-sm">
            Back to login
          </Link>
        </div>
      </div>
    </Layout>
  );
}
