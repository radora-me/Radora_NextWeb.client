import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import { AttendanceAttendanceRecord } from "@/types/api.types";
import { StudentAttendanceOverview } from "@/types/api.types";

export function useStudentAttendance() {
  return useQuery<StudentAttendanceOverview>({
    queryKey: ["student-attendance-overview"],
    queryFn: () => fetchJsonWithAuth<StudentAttendanceOverview>("/student/attendance/overview"),
  });
}
