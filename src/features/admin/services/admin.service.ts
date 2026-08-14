import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { AdminProfile } from "@/types/api.types";
import { AdminTeacher } from "@/types/api.types";
import { AdminStudent } from "@/types/api.types";
import { Holiday } from "@/types/api.types";

// ─── Types ──────────────────────────────────────────────────────────────────
// ─── Admin Profile ───────────────────────────────────────────────────────────

export function useAdminProfile() {
  return useQuery<AdminProfile>({
    queryKey: ["admin-profile"],
    queryFn: () => fetchJsonWithAuth<AdminProfile>("/auth/admin/profile"),
  });
}

export function useUpdateAdminProfile() {
  return useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const response = await fetchWithAuth("/auth/admin/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to update profile");
      return result as AdminProfile;
    },
  });
}

// ─── Teachers ────────────────────────────────────────────────────────────────

export function useAdminTeachers() {
  return useQuery<AdminTeacher[]>({
    queryKey: ["admin-teachers"],
    queryFn: () => fetchJsonWithAuth<AdminTeacher[]>("/auth/admin/teachers"),
  });
}

export function useAdminTeacher(teacherId: string | null) {
  return useQuery<AdminTeacher>({
    queryKey: ["admin-teacher", teacherId],
    queryFn: () => fetchJsonWithAuth<AdminTeacher>(`/auth/admin/teachers/${teacherId}`),
    enabled: !!teacherId,
  });
}

export function useUpdateAdminTeacher() {
  return useMutation({
    mutationFn: async (data: {
      teacherId: string;
      name?: string;
      email?: string;
      address?: string;
    }) => {
      const { teacherId, ...body } = data;
      const response = await fetchWithAuth(`/auth/admin/teachers/${teacherId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to update teacher");
      return result as AdminTeacher;
    },
  });
}

export function useCreateTeacher() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await fetchWithAuth("/auth/admin/create-teacher", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to create teacher");
      return result as { message: string; userId: string };
    },
  });
}

export function useSearchTeacher(email: string) {
  return useQuery<AdminTeacher>({
    queryKey: ["admin-search-teacher", email],
    queryFn: () => fetchJsonWithAuth<AdminTeacher>(`/auth/admin/search-teacher?email=${encodeURIComponent(email)}`),
    enabled: email.length > 2,
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useCreateStudent() {
  return useMutation({
    mutationFn: async (data: { name: string; rollNumber: string; password: string }) => {
      const response = await fetchWithAuth("/auth/admin/create-student", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to create student");
      return result as { message: string; userId: string };
    },
  });
}

export function useSearchStudent(rollNumber: string) {
  return useQuery<AdminStudent>({
    queryKey: ["admin-search-student", rollNumber],
    queryFn: () => fetchJsonWithAuth<AdminStudent>(`/auth/admin/search-student?rollNumber=${encodeURIComponent(rollNumber)}`),
    enabled: rollNumber.length > 0,
  });
}

// ─── Class Assignment ────────────────────────────────────────────────────────

export function useAssignTeacherClass() {
  return useMutation({
    mutationFn: async (data: {
      teacherEmail: string;
      className: string;
      section: string;
    }) => {
      const response = await fetchWithAuth("/auth/admin/assign-teacher-class", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to assign class");
      return result;
    },
  });
}

// ─── Holidays ────────────────────────────────────────────────────────────────

export function useAdminHolidays() {
  return useQuery<Holiday[]>({
    queryKey: ["admin-holidays"],
    queryFn: () => fetchJsonWithAuth<Holiday[]>("/auth/admin/holidays"),
  });
}

export function useCreateHoliday() {
  return useMutation({
    mutationFn: async (data: { title: string; date: string }) => {
      const response = await fetchWithAuth("/auth/admin/create-holiday", {
        method: "POST",
        body: JSON.stringify({ title: data.title, date: new Date(data.date).toISOString() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to create holiday");
      return result as Holiday;
    },
  });
}
