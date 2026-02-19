import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await adminApi.stats()).data
  });
}

export function usePendingTeachers() {
  return useQuery({
    queryKey: ["admin", "pending-teachers"],
    queryFn: async () => (await adminApi.pendingTeachers()).data
  });
}

export function usePendingStudents() {
  return useQuery({
    queryKey: ["admin", "pending-students"],
    queryFn: async () => (await adminApi.pendingStudents()).data
  });
}
