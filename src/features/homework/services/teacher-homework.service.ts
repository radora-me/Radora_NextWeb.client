import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface HomeworkAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueAt: string;
  allowLateSubmission: boolean;
  totalMarks: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  course: { id: string; title: string };
  submissionsCount: number;
  gradedCount: number;
}

export function useTeacherHomework() {
  return useQuery<HomeworkAssignment[]>({
    queryKey: ["teacher-homework"],
    queryFn: () => fetchJsonWithAuth<HomeworkAssignment[]>("/homework/teacher"),
  });
}

export function useCreateHomework() {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      dueAt?: string;
      totalMarks?: number;
      courseId: string;
      attachments?: { fileName: string; base64: string; mimeType: string }[];
    }) => {
      const response = await fetchWithAuth("/homework/teacher", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create homework");
      }
      return result;
    },
  });
}
