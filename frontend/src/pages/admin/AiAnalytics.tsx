import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AdminLayout } from "../../layout/AdminLayout";
import { ChartCard } from "../../components/ChartCard";
import { adminApi } from "../../api/adminApi";
import { LoadingState } from "../../components/LoadingState";

const colors = ["#1E5EFF", "#FF8A3D", "#0F766E", "#F97316"];

export function AiAnalytics() {
  const analyticsQuery = useQuery({
    queryKey: ["admin", "ai-analytics"],
    queryFn: async () => (await adminApi.aiAnalytics()).data
  });

  return (
    <AdminLayout title="AI Analytics">
      {analyticsQuery.isLoading && <LoadingState />}
      {analyticsQuery.data && (
        <div className="grid gap-4 lg:grid-cols-2 animate-rise reveal-1">
          <ChartCard title="Total AI Questions" subtitle="Last 30 days">
            <p className="text-3xl font-semibold text-ink">{analyticsQuery.data.totalQuestions}</p>
            <p className="text-xs text-slate">Avg response {analyticsQuery.data.avgResponseMs} ms</p>
          </ChartCard>
          <ChartCard title="Question Categories">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={analyticsQuery.data.categoryBreakdown} dataKey="value" nameKey="name" outerRadius={80}>
                  {analyticsQuery.data.categoryBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={colors[idx % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Top Teachers">
            <ul className="space-y-2 text-sm text-slate">
              {analyticsQuery.data.topTeachers.map((teacher) => (
                <li key={teacher.name} className="flex justify-between">
                  <span>{teacher.name}</span>
                  <span className="font-semibold text-ink">{teacher.count}</span>
                </li>
              ))}
            </ul>
          </ChartCard>
          <ChartCard title="Most Queried Documents">
            <ul className="space-y-2 text-sm text-slate">
              {analyticsQuery.data.topDocuments.map((doc) => (
                <li key={doc.title} className="flex justify-between">
                  <span>{doc.title}</span>
                  <span className="font-semibold text-ink">{doc.count}</span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
      )}
    </AdminLayout>
  );
}
