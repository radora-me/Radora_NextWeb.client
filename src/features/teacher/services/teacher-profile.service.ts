import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { TeacherProfileResponse } from "@/types/api.types";

// ─── Types ──────────────────────────────────────────────────────────────────
// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useTeacherProfile() {
  return useQuery<TeacherProfileResponse>({
    queryKey: ["teacher-profile"],
    queryFn: () => fetchJsonWithAuth<TeacherProfileResponse>("/auth/teacher/me"),
  });
}

export function useUpdateTeacherProfile() {
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
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update profile");
      }
      return result as TeacherProfileResponse;
    },
  });
}
