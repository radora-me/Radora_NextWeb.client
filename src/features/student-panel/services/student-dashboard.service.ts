import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import { StudentDashboardResponse } from "@/types/api.types";

export function useStudentDashboard() {
  return useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard"],
    queryFn: () => fetchJsonWithAuth<StudentDashboardResponse>("/student/dashboard"),
  });
}
