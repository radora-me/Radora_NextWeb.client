import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface StudentDashboardResponse {
  studentName: string;
  attendancePercentage: number;
  streak: number;
  level: {
    level: number;
    title: string;
    xpToNext: number;
    progress: number;
  };
  fees: {
    status: string;
    amount: number;
    academicYear: string;
  };
  upcomingClasses: any[];
  badges: any[];
  aiTutor: {
    subject: string;
    summary: string;
  };
}

export function useStudentDashboard() {
  return useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard"],
    queryFn: () => fetchJsonWithAuth<StudentDashboardResponse>("/student/dashboard"),
  });
}
