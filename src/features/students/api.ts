import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/api-client";

// ──────────────────────────────────────────
// CREATE STUDENT (Admin only)
// POST /auth/admin/create-student
// ──────────────────────────────────────────

export interface CreateStudentPayload {
  name: string;
  rollNumber: string;
  password: string;
}

export interface CreateStudentResponse {
  message: string;
  userId: string;
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStudentPayload): Promise<CreateStudentResponse> => {
      const res = await fetchWithAuth("/auth/admin/create-student", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to create student");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
  });
}

// ──────────────────────────────────────────
// CREATE TEACHER (Admin only)
// POST /auth/admin/create-teacher
// ──────────────────────────────────────────

export interface CreateTeacherPayload {
  name: string;
  email: string;
  password: string;
}

export interface CreateTeacherResponse {
  message: string;
  userId: string;
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTeacherPayload): Promise<CreateTeacherResponse> => {
      const res = await fetchWithAuth("/auth/admin/create-teacher", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to create teacher");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
}

// ──────────────────────────────────────────
// SEARCH STUDENT (Admin only)
// GET /auth/admin/search-student?rollNumber=...
// ──────────────────────────────────────────

export interface SearchedStudent {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  profilePhotoUrl: string | null;
  role: string;
}

export function useSearchStudent(rollNumber: string, enabled: boolean = true) {
  return useQuery<SearchedStudent>({
    queryKey: ["admin-search-student", rollNumber],
    queryFn: () => fetchJsonWithAuth<SearchedStudent>(`/auth/admin/search-student?rollNumber=${encodeURIComponent(rollNumber)}`),
    enabled: enabled && !!rollNumber.trim(),
    retry: false, // Don't retry on 404 (not found)
  });
}

// ──────────────────────────────────────────
// SEARCH TEACHER (Admin only)
// GET /auth/admin/search-teacher?email=...
// ──────────────────────────────────────────

export interface SearchedTeacher {
  id: string;
  name: string;
  email: string;
  courses: {
    id: string;
    title: string;
    description: string;
  }[];
}

export function useSearchTeacher(email: string, enabled: boolean = true) {
  return useQuery<SearchedTeacher>({
    queryKey: ["admin-search-teacher", email],
    queryFn: () => fetchJsonWithAuth<SearchedTeacher>(`/auth/admin/search-teacher?email=${encodeURIComponent(email)}`),
    enabled: enabled && !!email.trim(),
    retry: false, // Don't retry on 404 (not found)
  });
}

// ──────────────────────────────────────────
// ASSIGN CLASS TO TEACHER (Admin only)
// POST /auth/admin/assign-teacher-class
// ──────────────────────────────────────────

export interface AssignClassPayload {
  teacherEmail: string;
  className: string;
  section: string;
}

export function useAssignClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssignClassPayload) => {
      const res = await fetchWithAuth("/auth/admin/assign-teacher-class", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to assign class to teacher");
      return json;
    },
    onSuccess: (_, variables) => {
      // Invalidate teacher queries so the updated classes show up
      queryClient.invalidateQueries({ queryKey: ["admin-search-teacher", variables.teacherEmail] });
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
}

// ──────────────────────────────────────────
// HOLIDAYS API (Admin only)
// GET /auth/admin/holidays
// POST /auth/admin/create-holiday
// ──────────────────────────────────────────

export interface Holiday {
  id: string;
  title: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export function useAdminHolidays() {
  return useQuery<Holiday[]>({
    queryKey: ["admin-holidays"],
    queryFn: () => fetchJsonWithAuth<Holiday[]>("/auth/admin/holidays"),
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; date: string }) => {
      const res = await fetchWithAuth("/auth/admin/create-holiday", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to create holiday");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-holidays"] });
    },
  });
}

