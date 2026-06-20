import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";

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
