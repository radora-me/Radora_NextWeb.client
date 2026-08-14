import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { LeaveRecord } from "@/types/api.types";

export function useApplyLeave() {
  return useMutation({
    mutationFn: async (data: { fromDate: string; toDate: string; reason: string }) => {
      const response = await fetchWithAuth("/student/attendance/leave/apply", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to apply for leave");
      }
      return result;
    },
  });
}

export function useLeaveHistory() {
  return useQuery<LeaveRecord[]>({
    queryKey: ["student-leave-history"],
    queryFn: () => fetchJsonWithAuth<LeaveRecord[]>("/student/attendance/leave/history"),
  });
}
