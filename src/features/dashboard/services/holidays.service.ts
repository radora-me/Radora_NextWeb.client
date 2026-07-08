import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface Holiday {
  id: string;
  title: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export function useAdminHolidays() {
  return useQuery<Holiday[]>({
    queryKey: ["admin-holidays"],
    queryFn: () => fetchJsonWithAuth<Holiday[]>("/auth/admin/holidays"),
  });
}
