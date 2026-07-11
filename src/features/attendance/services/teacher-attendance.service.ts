import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface TeacherAttendanceCourse {
  id: string;
  title: string;
  description: string; // section e.g. "A"
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

export function useUpdateStudentAttendance() {
  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      rollNumber: string;
      status: "PRESENT" | "ABSENT" | "LATE";
      date: string;
    }) => {
      const res = await fetchWithAuth(
        `/teacher/attendance/course/${data.courseId}/student/${data.rollNumber}/attendance`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: data.status, date: data.date }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Failed to update attendance");
      return result;
    },
  });
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
}

export function useTeacherHolidays() {
  return useQuery<Holiday[]>({
    queryKey: ["teacher-holidays"],
    queryFn: () => fetchJsonWithAuth<Holiday[]>("/teacher/attendance/holidays"),
    staleTime: 5 * 60 * 1000, // 5 min — holidays rarely change
  });
}

export interface StudentAttendanceHistory {
  rollNumber: string;
  name: string;
  records: {
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
    markedBy: string | null;
  }[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
}

export function useStudentAttendanceHistory(
  courseId: string | null,
  rollNumber: string | null
) {
  return useQuery<StudentAttendanceHistory>({
    queryKey: ["student-attendance-history", courseId, rollNumber],
    queryFn: async () => {
      const res = await fetchJsonWithAuth<any>(
        `/teacher/attendance/course/${courseId}/student/${rollNumber}/attendance`
      );
      
      // The backend currently only returns a single day's record for this endpoint.
      // We wrap it in the expected history shape to satisfy the UI component.
      const isPresent = res.status === "PRESENT";
      return {
        rollNumber: res.rollNumber,
        name: res.name,
        records: [
          {
            date: res.date || new Date().toISOString(),
            status: res.status,
            markedBy: "Teacher",
          }
        ],
        summary: {
          total: 1,
          present: isPresent ? 1 : 0,
          absent: res.status === "ABSENT" ? 1 : 0,
          late: res.status === "LATE" ? 1 : 0,
          percentage: isPresent ? 100 : 0,
        }
      } as StudentAttendanceHistory;
    },
    enabled: !!courseId && !!rollNumber,
  });
}

export interface CourseStudent {
  id: string;
  name: string;
  rollNumber: string;
  profilePhotoUrl: string | null;
}

export function useCourseStudents(courseId: string | null) {
  return useQuery<CourseStudent[]>({
    queryKey: ["course-students", courseId],
    queryFn: () => fetchJsonWithAuth<CourseStudent[]>(`/teacher/attendance/course/${courseId}/students`),
    enabled: !!courseId,
  });
}
