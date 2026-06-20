import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

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

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; date: string }) => {
      const res = await fetchWithAuth("/auth/admin/create-holiday", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to create holiday");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-holidays"] });
    },
  });
}
