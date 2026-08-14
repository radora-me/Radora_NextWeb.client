import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

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
    file: {
      id: string;
      fileName: string;
      originalName: string;
      mimeType: string;
      size: number;
      publicUrl: string;
    };
  }[];
  submissions: {
    id: string;
    studentId: string;
    submittedAt: string;
    status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
    marks: number | null;
    gradedAt: string | null;
  }[];
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
