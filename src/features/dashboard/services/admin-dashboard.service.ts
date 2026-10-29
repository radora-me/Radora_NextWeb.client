import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import type { UserRole } from "@/types";

export interface AdminDashboardOverview {
  stats: {
    studentCount: number;
    teacherCount: number;
    attendanceRate: number;
    homeworkCount: number;
    submissionCount: number;
    gradedSubmissionCount: number;
  };
  attendanceTrend: { month: string; attendance: number; present: number; absent: number; leave: number; total: number; key: string }[];
  gradeDistribution: { grade: string; students: number }[];
  upcomingEvents: { id: string; title: string; date: string; type: "holiday" | "deadline" | "event"; description?: string }[];
  recentActivities: { id: string; user: string; action: string; target: string; timestamp: string }[];
}

export function useAdminDashboardOverview(role: UserRole | undefined) {
  return useQuery<AdminDashboardOverview>({
    queryKey: ["admin-dashboard-overview"],
    queryFn: () => fetchJsonWithAuth<AdminDashboardOverview>("/admin/dashboard/overview"),
    enabled: role === "admin",
    staleTime: 60_000,
  });
}
