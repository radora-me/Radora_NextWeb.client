import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface AttendanceRecord {
  id?: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "EXCUSED";
  remarks?: string;
}

export interface StudentAttendanceOverview {
  overallAttendance: number;
  eligibility: string;
  totalClasses: number;
  attendedClasses: number;
  presentClasses: number;
  absentClasses: number;
  leaveClasses: number;
  records: AttendanceRecord[];
  holidays: {
    id: string;
    title: string;
    date: string;
  }[];
}

export function useStudentAttendance() {
  return useQuery<StudentAttendanceOverview>({
    queryKey: ["student-attendance-overview"],
    queryFn: () => fetchJsonWithAuth<StudentAttendanceOverview>("/student/attendance/overview"),
  });
}
