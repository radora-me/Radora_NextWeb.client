import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { StudentHomework } from "@/types/api.types";
import { StudentSubmission } from "@/types/api.types";
import { SubmitHomeworkPayload } from "@/types/api.types";

export function useStudentHomework() {
  return useQuery<StudentHomework[]>({
    queryKey: ["student-homework"],
    queryFn: () => fetchJsonWithAuth<StudentHomework[]>("/homework/student"),
  });
}

export function useStudentHomeworkDetail(homeworkId: string | null) {
  return useQuery<StudentHomework>({
    queryKey: ["student-homework-detail", homeworkId],
    queryFn: () => fetchJsonWithAuth<StudentHomework>(`/homework/student/${homeworkId}`),
    enabled: !!homeworkId,
  });
}

export function useStudentSubmission(homeworkId: string | null) {
  return useQuery<StudentSubmission>({
    queryKey: ["student-submission", homeworkId],
    queryFn: () => fetchJsonWithAuth<StudentSubmission>(`/homework/student/${homeworkId}/submission`),
    enabled: !!homeworkId,
    retry: false,
  });
}

export function useSubmitHomework() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ homeworkId, payload }: { homeworkId: string, payload: SubmitHomeworkPayload }) => {
      const response = await fetchWithAuth(`/homework/student/${homeworkId}/submission`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit homework");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-homework"] });
      queryClient.invalidateQueries({ queryKey: ["student-homework-detail", variables.homeworkId] });
      queryClient.invalidateQueries({ queryKey: ["student-submission", variables.homeworkId] });
    }
  });
}
