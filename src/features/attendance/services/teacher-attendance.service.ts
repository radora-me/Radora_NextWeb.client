import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface TeacherAttendanceCourse {
  id: string;
  title: string;
  _count: { enrollments: number };
}

export interface StudentAttendanceRecord {
  studentId: string;
  name: string;
  rollNumber: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  isMarked: boolean;
  canEdit: boolean;
  createdAt: string | null;
}

export function useTeacherCourses() {
  return useQuery<TeacherAttendanceCourse[]>({
    queryKey: ["teacher-courses"],
    queryFn: () => fetchJsonWithAuth<TeacherAttendanceCourse[]>("/teacher/attendance/my-courses"),
  });
}

export function useCourseAttendance(courseId: string | null, date: Date) {
  const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
  return useQuery<StudentAttendanceRecord[]>({
    queryKey: ["course-attendance", courseId, formattedDate],
    queryFn: () => fetchJsonWithAuth<StudentAttendanceRecord[]>(`/teacher/attendance/course/${courseId}/attendance?date=${formattedDate}`),
    enabled: !!courseId, // Only fetch if a course is selected
  });
}

export function useSubmitAttendance() {
  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      date: string;
      students: { studentId: string; status: string }[];
    }) => {
      const response = await fetchWithAuth("/teacher/attendance/full-day", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to submit attendance");
      }
      return result;
    },
  });
}
