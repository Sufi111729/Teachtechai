import { apiClient } from "./axios";

export interface AdminStats {
  pendingTeachers: number;
  pendingStudents: number;
  approvedUsers: number;
  totalDocuments: number;
  aiQueriesToday: number;
  systemHealth: string;
}

export interface ApprovalItem {
  id: number;
  name: string;
  email: string;
  type: "TEACHER" | "STUDENT";
  requestedDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface AiAnalytics {
  totalQuestions: number;
  avgResponseMs: number;
  topTeachers: Array<{ name: string; count: number }>;
  topDocuments: Array<{ title: string; count: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
}

export interface ActivityLog {
  id: number;
  description: string;
  timestamp: string;
  type: "APPROVAL" | "DOCUMENT" | "REGISTRATION" | "AI";
}

export const adminApi = {
  stats: () => apiClient.get<AdminStats>("/api/admin/stats"),
  pendingTeachers: () => apiClient.get("/api/admin/pending/teachers"),
  pendingStudents: () => apiClient.get("/api/admin/pending/students"),
  approveTeacher: (userId: number) => apiClient.put(`/api/admin/teachers/${userId}/approve`),
  rejectTeacher: (userId: number) => apiClient.put(`/api/admin/teachers/${userId}/reject`),
  approveStudent: (userId: number) => apiClient.put(`/api/admin/students/${userId}/approve`),
  rejectStudent: (userId: number) => apiClient.put(`/api/admin/students/${userId}/reject`),
  aiAnalytics: () => apiClient.get<AiAnalytics>("/api/admin/ai-analytics"),
  activityLogs: () => apiClient.get<ActivityLog[]>("/api/admin/activity")
};
