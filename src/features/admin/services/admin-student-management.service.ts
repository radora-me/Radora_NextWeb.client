import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import type { StudentAttendanceRecord, TeacherAttendanceCourse, TeacherStudent } from "@/types/api.types";

export type AdminAttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";

export interface AdminStudentAttendanceHistory {
  name: string;
  rollNumber: string;
  courseTitle: string;
  section: string;
  records: {
    date: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    mode: "FULL_DAY" | "SUBJECT_WISE";
  }[];
}

export interface AdminStudentAcademicRecord {
  student: {
    name: string;
    rollNumber: string;
    className: string;
    profilePhotoUrl: string | null;
    courses: { id: string; title: string; description: string | null }[];
  };
  attendance: {
    date: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    mode: "FULL_DAY" | "SUBJECT_WISE";
    course: { id: string; title: string; description: string | null } | null;
  }[];
  assignments: {
    id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    dueAt: string | null;
    totalMarks: number | null;
    status: string;
    course: { id: string; title: string; description: string | null };
    teacherName: string;
    submission: { submittedAt: string; status: string; marks: number | null; feedback: string | null; gradedAt: string | null } | null;
    grade: { marks: number; totalMarks: number | null; percentage: number | null } | null;
  }[];
  summary: { total: number; submitted: number; pending: number; graded: number; averagePercentage: number };
}

export function useAdminStudentClasses() {
  return useQuery<TeacherAttendanceCourse[]>({
    queryKey: ["admin-student-management-classes"],
    queryFn: () => fetchJsonWithAuth<TeacherAttendanceCourse[]>("/teacher/attendance/available-classes"),
  });
}

export function useAdminStudents() {
  return useQuery<TeacherStudent[]>({
    queryKey: ["admin-student-management-students"],
    queryFn: () => fetchJsonWithAuth<TeacherStudent[]>("/teacher/students"),
  });
}

export function useAdminAssignStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rollNumber, courseId }: { rollNumber: string; courseId: string }) => {
      const response = await fetchWithAuth(`/teacher/students/by-roll/${encodeURIComponent(rollNumber)}`, {
        method: "PUT",
        body: JSON.stringify({ courseIds: [courseId] }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to assign student");
      return result as TeacherStudent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-student-management-students"] });
      queryClient.invalidateQueries({ queryKey: ["admin-course-attendance", variables.courseId] });
    },
  });
}

export function useAdminStudentAttendanceHistory(courseId: string | null, rollNumber: string | null) {
  return useQuery<AdminStudentAttendanceHistory>({
    queryKey: ["admin-student-attendance-history", courseId, rollNumber],
    queryFn: () => fetchJsonWithAuth<AdminStudentAttendanceHistory>(
      `/teacher/attendance/course/${courseId}/student/${encodeURIComponent(rollNumber || "")}/history`,
    ),
    enabled: Boolean(courseId && rollNumber),
  });
}

export function useAdminStudentAcademicRecord(rollNumber: string | null) {
  return useQuery<AdminStudentAcademicRecord>({
    queryKey: ["admin-student-academic-record", rollNumber],
    queryFn: () => fetchJsonWithAuth<AdminStudentAcademicRecord>(
      `/homework/admin/student/${encodeURIComponent(rollNumber || "")}`,
    ),
    enabled: Boolean(rollNumber),
  });
}

export function useAdminCourseAttendance(courseId: string | null, date: string) {
  return useQuery<StudentAttendanceRecord[]>({
    queryKey: ["admin-course-attendance", courseId, date],
    queryFn: () => fetchJsonWithAuth<StudentAttendanceRecord[]>(
      `/teacher/attendance/course/${courseId}/attendance?date=${date}`,
    ),
    enabled: Boolean(courseId),
  });
}

export function useAdminSubmitAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      date,
      students,
    }: {
      courseId: string;
      date: string;
      students: { studentId: string; status: AdminAttendanceStatus }[];
    }) => {
      const response = await fetchWithAuth("/teacher/attendance/full-day", {
        method: "POST",
        body: JSON.stringify({ courseId, date, students, allowEdit: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit attendance");
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-attendance", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin-student-attendance-history", variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin-student-academic-record"] });
    },
  });
}

