import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { AdminLayout } from "../../layout/AdminLayout";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { ConfirmModal } from "../../components/ConfirmModal";
import { EmptyState } from "../../components/EmptyState";
import { LoadingState } from "../../components/LoadingState";

export function Approvals() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<{ open: boolean; userId: number | null; action: "approve" | "reject" | null }>({
    open: false,
    userId: null,
    action: null
  });

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

  const combined = useMemo(() => {
    return [...(teachersQuery.data || []), ...(studentsQuery.data || [])].map((item: any) => ({
      ...item,
      type: item.teacherCode ? "TEACHER" : "STUDENT"
    }));
  }, [teachersQuery.data, studentsQuery.data]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return combined.filter((item: any) =>
      [item.name, item.email, item.teacherCode, item.assignedTeacherCode, item.rollNo]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [combined, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!modal.userId || !modal.action) return;
      const target = combined.find((item) => item.userId === modal.userId);
      if (!target) return;
      if (target.type === "TEACHER") {
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

  return (
    <AdminLayout title="Approvals">
      <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-soft backdrop-blur animate-rise reveal-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-ink">Quick Approvals</h2>
          <div className="ml-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin"] })}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 text-sm text-ink"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>

        <div className="mt-4">
          {(teachersQuery.isLoading || studentsQuery.isLoading) && <LoadingState />}
          {!teachersQuery.isLoading && !studentsQuery.isLoading && paged.length === 0 && (
            <EmptyState title="No pending requests" description="All approvals are completed." />
          )}
          {paged.length > 0 && (
            <DataTable headers={["Select", "Name", "Email", "Type", "Requested", "Status", "Actions"]}>
              {paged.map((item: any, idx: number) => (
                <tr key={item.userId} className={idx % 2 === 0 ? "bg-white/60" : "bg-white/30"}>
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-ink">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate">{item.email}</td>
                  <td className="px-4 py-3 text-sm text-slate">{item.type}</td>
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

      <ConfirmModal
        open={modal.open}
        title={modal.action === "approve" ? "Approve request" : "Reject request"}
        description="This action will update the user status immediately."
        confirmLabel={modal.action === "approve" ? "Approve" : "Reject"}
        onClose={() => setModal({ open: false, userId: null, action: null })}
        onConfirm={() => mutation.mutate()}
      />
    </AdminLayout>
  );
}
