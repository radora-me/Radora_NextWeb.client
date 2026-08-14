import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TeacherCourseWithCount {
  id: string;
  title: string;
  description: string | null;
  teacherId: string;
  createdAt: string;
  _count: { enrollments: number };
}

export interface TeacherHomeworkItem {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  course: { id: string; title: string };
  submissionsCount: number;
  gradedCount: number;
  createdAt: string;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Returns the teacher's courses with enrollment counts.
 * Endpoint: GET /teacher/attendance/my-courses
 */
export function useTeacherCourses() {
  return useQuery<TeacherCourseWithCount[]>({
    queryKey: ["teacher-courses"],
    queryFn: () =>
      fetchJsonWithAuth<TeacherCourseWithCount[]>("/teacher/attendance/my-courses"),
    staleTime: 60_000,
  });
}

/**
 * Returns all homework created by the teacher (published + draft).
 * Endpoint: GET /homework/teacher
 */
export function useTeacherHomeworkList() {
  return useQuery<TeacherHomeworkItem[]>({
    queryKey: ["teacher-homework-list"],
    queryFn: () =>
      fetchJsonWithAuth<TeacherHomeworkItem[]>("/homework/teacher"),
    staleTime: 60_000,
  });
}
