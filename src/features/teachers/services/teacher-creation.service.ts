import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";

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
