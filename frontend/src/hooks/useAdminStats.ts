import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await adminApi.stats()).data
  });
}
