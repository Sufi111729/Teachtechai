import { ReactNode, useMemo, useRef, useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import toast from "react-hot-toast";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const prevPendingRef = useRef(0);

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

  const notifications = useMemo(() => {
    const teachers = (teachersQuery.data || []).slice(0, 3).map((t: any) => ({
      id: t.userId,
      label: `Teacher approval: ${t.name}`,
      timestamp: new Date(t.createdAt).toLocaleString()
    }));
    const students = (studentsQuery.data || []).slice(0, 3).map((s: any) => ({
      id: s.userId,
      label: `Student approval: ${s.name}`,
      timestamp: new Date(s.createdAt).toLocaleString()
    }));
    return [...teachers, ...students].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);
  }, [teachersQuery.data, studentsQuery.data]);

  const pendingCount = (teachersQuery.data?.length || 0) + (studentsQuery.data?.length || 0);

  useEffect(() => {
    if (pendingCount > prevPendingRef.current) {
      toast.success("New approval request received");
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount]);

  return (
    <div className="min-h-screen text-ink">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-h-screen">
          <Topbar
            title={title}
            onMenu={() => setSidebarOpen(true)}
            notifications={notifications}
            pendingCount={pendingCount}
          />
          <main className="px-6 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
