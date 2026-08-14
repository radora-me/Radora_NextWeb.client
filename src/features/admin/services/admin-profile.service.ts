import { useQuery, useMutation } from "@tanstack/react-query";
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
