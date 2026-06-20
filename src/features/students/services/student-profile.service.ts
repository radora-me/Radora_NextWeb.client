import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  profilePhotoUrl: string | null;
  attendancePercentage: number;
  streak: number;
  courses: {
    id: string;
    title: string;
    description: string;
  }[];
}

export function useStudentProfile() {
  return useQuery<StudentProfile>({
    queryKey: ["student-profile"],
    queryFn: () => fetchJsonWithAuth<StudentProfile>("/student/profile"),
  });
}
