import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { AdminProfileResponse } from "@/types/api.types";

export function useAdminProfile() {
  return useQuery<AdminProfileResponse>({
    queryKey: ["admin-profile"],
    queryFn: () => fetchJsonWithAuth<AdminProfileResponse>("/auth/admin/profile"),
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
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update profile");
      }
      return result as AdminProfileResponse;
    },
  });
}

export function useUploadAdminProfilePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("photo", file);
      const response = await fetchWithAuth("/auth/profile/photo", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to upload profile photo");
      return result as AdminProfileResponse;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-profile"] }),
  });
}
