import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { TeacherAttendanceCourse } from "@/types/api.types";
import { StudentAttendanceRecord } from "@/types/api.types";
import { AttendanceHoliday } from "@/types/api.types";
import { StudentAttendanceHistory } from "@/types/api.types";
import { CourseStudent } from "@/types/api.types";

export function useTeacherCourses() {
  return useQuery<TeacherAttendanceCourse[]>({
    queryKey: ["teacher-courses"],
    queryFn: () => fetchJsonWithAuth<TeacherAttendanceCourse[]>("/teacher/attendance/my-courses"),
  });
}

export function useTeacherAvailableClasses() {
  return useQuery<TeacherAttendanceCourse[]>({
    queryKey: ["teacher-available-classes"],
    queryFn: () => fetchJsonWithAuth<TeacherAttendanceCourse[]>("/teacher/attendance/available-classes"),
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

export function useSubmitSubjectAttendance() {
  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      date: string;
      subjectName: string;
      students: { studentId: string; status: string }[];
    }) => {
      const response = await fetchWithAuth("/teacher/attendance/subject-wise", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to submit subject attendance");
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
      status: "PRESENT" | "ABSENT" | "LEAVE";
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

export function useTeacherHolidays() {
  return useQuery<AttendanceHoliday[]>({
    queryKey: ["teacher-holidays"],
    queryFn: () => fetchJsonWithAuth<AttendanceHoliday[]>("/teacher/attendance/holidays"),
    staleTime: 5 * 60 * 1000, // 5 min — holidays rarely change
  });
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
          leave: res.status === "LEAVE" ? 1 : 0,
          percentage: isPresent ? 100 : 0,
        }
      } as StudentAttendanceHistory;
    },
    enabled: !!courseId && !!rollNumber,
  });
}

export function useCourseStudents(courseId: string | null) {
  return useQuery<CourseStudent[]>({
    queryKey: ["course-students", courseId],
    queryFn: () => fetchJsonWithAuth<CourseStudent[]>(`/teacher/attendance/course/${courseId}/students`),
    enabled: !!courseId,
  });
}
