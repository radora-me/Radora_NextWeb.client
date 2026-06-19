import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  profilePhotoUrl: string | null;
  courses: TeacherCourse[];
  addedAt: string;
}

export function useTeacherStudents() {
  return useQuery<TeacherStudent[]>({
    queryKey: ["teacher-students"],
    queryFn: () => fetchJsonWithAuth<TeacherStudent[]>("/teacher/students"),
  });
}

// ==========================================
// ATTENDANCE API
// ==========================================

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

// ==========================================
// HOMEWORK API
// ==========================================

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueAt: string;
  allowLateSubmission: boolean;
  totalMarks: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  course: { id: string; title: string };
  submissionsCount: number;
  gradedCount: number;
}

export function useTeacherHomework() {
  return useQuery<HomeworkAssignment[]>({
    queryKey: ["teacher-homework"],
    queryFn: () => fetchJsonWithAuth<HomeworkAssignment[]>("/homework/teacher"),
  });
}

export function useCreateHomework() {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueAt?: string;
      totalMarks?: number;
      courseId: string;
      attachments?: { fileName: string; base64: string; mimeType: string }[];
    }) => {
      const response = await fetchWithAuth("/homework/teacher", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create homework");
      }
      return result;
    },
  });
}

// Chat API moved to @/features/chat/api.ts
