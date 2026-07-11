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
  course: { id: string; title: string; description?: string | null; };
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

export function useUpdateHomework() {
  return useMutation({
    mutationFn: async ({
      homeworkId,
      data,
    }: {
      homeworkId: string;
      data: {
        title?: string;
        description?: string;
        dueAt?: string;
        totalMarks?: number;
        status?: "PUBLISHED" | "DRAFT";
        attachments?: { fileName: string; base64: string; mimeType: string }[];
      };
    }) => {
      const response = await fetchWithAuth(`/homework/teacher/${homeworkId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update homework");
      }
      return result;
    },
  });
}

export function useDeleteHomework() {
  return useMutation({
    mutationFn: async (homeworkId: string) => {
      const response = await fetchWithAuth(`/homework/teacher/${homeworkId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to delete homework");
      }
      return result;
    },
  });
}

export function useTeacherHomeworkDetail(homeworkId: string | null) {
  return useQuery<HomeworkAssignment>({
    queryKey: ["teacher-homework-detail", homeworkId],
    queryFn: () => fetchJsonWithAuth<HomeworkAssignment>(`/homework/teacher/${homeworkId}`),
    enabled: !!homeworkId,
  });
}

export function useReopenResubmission() {
  return useMutation({
    mutationFn: async (homeworkId: string) => {
      const res = await fetchWithAuth(`/homework/teacher/${homeworkId}/resubmissions/reopen`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Failed to reopen");
      return result;
    },
  });
}

export interface TeacherSubmissionData {
  homework: HomeworkAssignment;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  pendingCount: number;
  students: {
    student: {
      id: string;
      name: string;
      rollNumber: string;
      className: string | null;
      profilePhotoUrl: string | null;
    };
    status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
    hasSubmission: boolean;
    submission: {
      id: string;
      studentId: string;
      textSubmission: string | null;
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
  }[];
}

export function useTeacherSubmissions(homeworkId: string | null) {
  return useQuery<TeacherSubmissionData>({
    queryKey: ["teacher-submissions", homeworkId],
    queryFn: () => fetchJsonWithAuth<TeacherSubmissionData>(`/homework/teacher/${homeworkId}/submissions`),
    enabled: !!homeworkId,
  });
}

export function useGradeSubmission() {
  return useMutation({
    mutationFn: async ({ homeworkId, studentId, marks, feedback }: { homeworkId: string, studentId: string, marks: number, feedback: string }) => {
      const res = await fetchWithAuth(`/homework/teacher/${homeworkId}/submissions/${studentId}/grade`, {
        method: "POST",
        body: JSON.stringify({ marks, feedback }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message || "Failed to grade");
      return result;
    },
  });
}
