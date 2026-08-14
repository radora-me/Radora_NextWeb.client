import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";

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
