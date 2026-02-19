import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "../../layout/AdminLayout";
import { adminApi } from "../../api/adminApi";
import { LoadingState } from "../../components/LoadingState";

export function ActivityLogs() {
  const logsQuery = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () => (await adminApi.activityLogs()).data
  });

  return (
    <AdminLayout title="Activity Logs">
      {logsQuery.isLoading && <LoadingState />}
      {logsQuery.data && (
        <div className="space-y-4 animate-rise reveal-1">
          {logsQuery.data.map((log) => (
            <div key={log.id} className="rounded-3xl border border-white/70 bg-white/70 px-4 py-3 shadow-soft backdrop-blur">
              <p className="text-sm font-semibold text-ink">{log.description}</p>
              <p className="text-xs text-slate">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
