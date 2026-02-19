import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CheckCircle2, FileText, Hourglass, ShieldCheck, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { AdminLayout } from "../../layout/AdminLayout";
import { useAdminStats } from "../../hooks/useAdminStats";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../api/adminApi";
import { StatsCard } from "../../components/StatsCard";
import { ChartCard } from "../../components/ChartCard";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { ConfirmModal } from "../../components/ConfirmModal";
import { EmptyState } from "../../components/EmptyState";
import { LoadingState } from "../../components/LoadingState";

const lineData = [
  { name: "Mon", users: 120 },
  { name: "Tue", users: 220 },
  { name: "Wed", users: 280 },
  { name: "Thu", users: 260 },
  { name: "Fri", users: 320 },
  { name: "Sat", users: 400 },
  { name: "Sun", users: 460 }
];

const barData = [
  { name: "Mon", approvals: 18 },
  { name: "Tue", approvals: 24 },
  { name: "Wed", approvals: 32 },
  { name: "Thu", approvals: 28 },
  { name: "Fri", approvals: 40 },
  { name: "Sat", approvals: 44 },
  { name: "Sun", approvals: 36 }
];

const areaData = [
  { name: "Mon", ai: 60 },
  { name: "Tue", ai: 82 },
  { name: "Wed", ai: 105 },
  { name: "Thu", ai: 98 },
  { name: "Fri", ai: 130 },
  { name: "Sat", ai: 155 },
  { name: "Sun", ai: 180 }
];

const docsData = [
  { name: "Mon", docs: 10 },
  { name: "Tue", docs: 14 },
  { name: "Wed", docs: 16 },
  { name: "Thu", docs: 12 },
  { name: "Fri", docs: 18 },
  { name: "Sat", docs: 21 },
  { name: "Sun", docs: 24 }
];

const pieData = [
  { name: "Science", value: 40 },
  { name: "Math", value: 30 },
  { name: "History", value: 18 },
  { name: "Other", value: 12 }
];

const pieColors = ["#6366F1", "#10B981", "#F59E0B", "#E11D48"];

export function Dashboard() {
  const [tab, setTab] = useState<"teachers" | "students">("teachers");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<{ open: boolean; userId: number | null; action: "approve" | "reject" | null }>({
    open: false,
    userId: null,
    action: null
  });

  const statsQuery = useAdminStats();
  const queryClient = useQueryClient();

  const teachersQuery = useQuery({
    queryKey: ["admin", "pending-teachers"],
    queryFn: async () => (await adminApi.pendingTeachers()).data,
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  });
  const studentsQuery = useQuery({
    queryKey: ["admin", "pending-students"],
    queryFn: async () => (await adminApi.pendingStudents()).data,
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!modal.userId || !modal.action) return;
      if (tab === "teachers") {
        return modal.action === "approve"
          ? adminApi.approveTeacher(modal.userId)
          : adminApi.rejectTeacher(modal.userId);
      }
      return modal.action === "approve"
        ? adminApi.approveStudent(modal.userId)
        : adminApi.rejectStudent(modal.userId);
    },
    onSuccess: () => {
      toast.success("Action completed");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("Action failed"),
    onSettled: () => setModal({ open: false, userId: null, action: null })
  });

  const data = tab === "teachers" ? teachersQuery.data || [] : studentsQuery.data || [];
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return data.filter((item: any) =>
      [item.name, item.email, item.teacherCode, item.assignedTeacherCode, item.rollNo]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-4 flex items-center justify-end animate-rise reveal-1">
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin"] })}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink"
        >
          <RefreshCcw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 animate-rise reveal-2">
        <StatsCard
          label="Pending Teachers"
          value={statsQuery.data?.pendingTeachers ?? 0}
          trend="+12% this week"
          icon={<Hourglass size={18} />}
          tone="pending"
        />
        <StatsCard
          label="Pending Students"
          value={statsQuery.data?.pendingStudents ?? 0}
          trend="+8% this week"
          icon={<ShieldCheck size={18} />}
          tone="pending"
        />
        <StatsCard
          label="Approved Users"
          value={statsQuery.data?.approvedUsers ?? 0}
          trend="+18% this month"
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
        <StatsCard
          label="Total Documents"
          value={statsQuery.data?.totalDocuments ?? 0}
          trend="+5% this week"
          icon={<FileText size={18} />}
          tone="neutral"
        />
        <StatsCard
          label="AI Queries Today"
          value={statsQuery.data?.aiQueriesToday ?? 0}
          trend="+20% today"
          icon={<Zap size={18} />}
          tone="neutral"
        />
        <StatsCard
          label="System Health"
          value={statsQuery.data?.systemHealth ?? "Healthy"}
          trend="99.9% uptime"
          icon={<BarChart3 size={18} />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4 animate-rise reveal-2">
        <ChartCard title="User Growth" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Approvals" subtitle="Daily approvals">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="approvals" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="AI Usage" subtitle="Queries per day">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="ai" stroke="#6366F1" fill="#E0E7FF" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Documents" subtitle="Uploads last 7 days">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={docsData}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="docs" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-6 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-soft backdrop-blur animate-rise reveal-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("teachers")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "teachers" ? "bg-brand text-white" : "bg-white/70 text-ink"}`}
            >
              Pending Teachers
            </button>
            <button
              onClick={() => setTab("students")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "students" ? "bg-brand text-white" : "bg-white/70 text-ink"}`}
            >
              Pending Students
            </button>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          {(tab === "teachers" ? teachersQuery.isLoading : studentsQuery.isLoading) && <LoadingState />}
          {!teachersQuery.isLoading && !studentsQuery.isLoading && paged.length === 0 && (
            <EmptyState title="No pending requests" description="All caught up." />
          )}
          {paged.length > 0 && (
            <DataTable
              headers={
                tab === "teachers"
                  ? ["Select", "Name", "Email", "Type", "Requested", "Status", "Actions"]
                  : ["Select", "Name", "Email", "Type", "Requested", "Status", "Actions"]
              }
            >
              {paged.map((item: any, idx: number) => (
                <tr key={item.userId} className={idx % 2 === 0 ? "bg-white/60" : "bg-white/30"}>
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-ink">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate">{item.email}</td>
                  <td className="px-4 py-3 text-sm text-slate">{tab === "teachers" ? "Teacher" : "Student"}</td>
                  <td className="px-4 py-3 text-sm text-slate">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ open: true, userId: item.userId, action: "approve" })}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setModal({ open: true, userId: item.userId, action: "reject" })}
                        className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-800"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-soft backdrop-blur animate-rise reveal-3">
        <p className="mb-3 text-sm font-semibold text-ink">AI Question Categories</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
              {pieData.map((_, idx) => (
                <Cell key={idx} fill={pieColors[idx]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ConfirmModal
        open={modal.open}
        title={modal.action === "approve" ? "Approve account" : "Reject account"}
        description="This action will update the user status immediately."
        confirmLabel={modal.action === "approve" ? "Approve" : "Reject"}
        onClose={() => setModal({ open: false, userId: null, action: null })}
        onConfirm={() => mutation.mutate()}
      />
    </AdminLayout>
  );
}
