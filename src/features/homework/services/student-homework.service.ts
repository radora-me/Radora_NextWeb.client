import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface StudentHomework {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  dueAt: string | null;
  allowLateSubmission: boolean;
  totalMarks: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    name: string;
    email: string | null;
  };
  course: {
    id: string;
    title: string;
    description: string | null;
  };
  attachments: {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    publicUrl: string;
    downloadUrl: string;
  }[];
  canSubmit: boolean;
  canResubmit: boolean;
  mySubmission: {
    id: string;
    studentId: string;
    submittedAt: string;
    status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
    marks: number | null;
    feedback: string | null;
    gradedAt: string | null;
    attachments: {
      id: string;
      fileName: string;
      mimeType: string;
      size: number;
      publicUrl: string;
    }[];
  } | null;
}

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

export interface StudentSubmission {
  id: string;
  studentId: string;
  submittedAt: string | null;
  status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
  marks: number | null;
  feedback: string | null;
  gradedAt: string | null;
  attachments: {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    publicUrl: string;
  }[];
}

export function useStudentSubmission(homeworkId: string | null) {
  return useQuery<StudentSubmission>({
    queryKey: ["student-submission", homeworkId],
    queryFn: () => fetchJsonWithAuth<StudentSubmission>(`/homework/student/${homeworkId}/submission`),
    enabled: !!homeworkId,
    retry: false,
  });
}

export interface SubmitHomeworkPayload {
  textSubmission?: string;
  attachments?: {
    fileName: string;
    mimeType: string;
    base64: string;
  }[];
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
