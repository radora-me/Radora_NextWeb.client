import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export type TestQuestion = { id: string; order: number; prompt: string; options: string[]; correctOption?: string; marks: number; answer?: { selectedOption?: string | null; isCorrect?: boolean; marksAwarded?: number } | null };
export type ProctoredTest = { id: string; title: string; description?: string | null; instructions?: string | null; durationMinutes: number; availableFrom?: string | null; dueAt: string; status: "DRAFT" | "PUBLISHED" | "CLOSED"; resultPublished: boolean; maxViolations: number; totalMarks: number; course?: { id: string; title: string }; teacher?: { name: string }; questions: TestQuestion[]; attemptsCount?: number; myAttempt?: { id: string; status: string; startedAt: string; expiresAt: string; submittedAt?: string | null; score?: number | null; teacherMarks?: number | null; finalMarks?: number | null; teacherFeedback?: string | null; violationCount: number } | null };
export type ProctoredAttempt = { id: string; status: string; startedAt: string; expiresAt: string; submittedAt?: string | null; autoSubmittedAt?: string | null; score?: number | null; teacherMarks?: number | null; finalMarks?: number | null; totalMarks: number; percentage?: number | null; teacherFeedback?: string | null; violationCount: number; student?: { name: string; email?: string | null; rollNumber?: string | null; profilePhotoUrl?: string | null }; test: ProctoredTest; questions: TestQuestion[] };

async function jsonRequest<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
  const response = await fetchWithAuth(endpoint, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(result.errors) && result.errors.length ? `: ${result.errors.join("; ")}` : "";
    throw new Error(`${result.message || result.error || "Unable to complete request"}${details}`);
  }
  return result as T;
}

const cachedQueryOptions = { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false } as const;
export function useTeacherTests() { return useQuery<ProctoredTest[]>({ queryKey: ["teacher-proctored-tests"], queryFn: () => fetchJsonWithAuth("/tests/teacher"), ...cachedQueryOptions }); }
export function useStudentTests() { return useQuery<ProctoredTest[]>({ queryKey: ["student-proctored-tests"], queryFn: () => fetchJsonWithAuth("/tests/student"), ...cachedQueryOptions }); }
export function useAdminTests() { return useQuery<ProctoredTest[]>({ queryKey: ["admin-proctored-tests"], queryFn: () => fetchJsonWithAuth("/tests/admin"), ...cachedQueryOptions }); }
export function useCreateTest() { const qc = useQueryClient(); return useMutation({ mutationFn: (data: unknown) => jsonRequest<ProctoredTest>("/tests/teacher", "POST", data), onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-proctored-tests"] }) }); }
export function usePublishTest() { const qc = useQueryClient(); return useMutation({ mutationFn: (testId: string) => jsonRequest<ProctoredTest>(`/tests/teacher/${testId}/publish`, "POST"), onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-proctored-tests"] }) }); }
export function useCloseTest() { const qc = useQueryClient(); return useMutation({ mutationFn: (testId: string) => jsonRequest<ProctoredTest>(`/tests/teacher/${testId}/close`, "POST"), onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-proctored-tests"] }) }); }
export function usePublishResults() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ testId, resultPublished }: { testId: string; resultPublished: boolean }) => jsonRequest<ProctoredTest>(`/tests/teacher/${testId}/results`, "POST", { resultPublished }), onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-proctored-tests"] }) }); }
export function useTestAttempts(testId: string | null, admin = false) { return useQuery<{ test: ProctoredTest; attempts: ProctoredAttempt[] }>({ queryKey: [admin ? "admin" : "teacher", "test-attempts", testId], queryFn: () => fetchJsonWithAuth(`/tests/${admin ? "admin" : "teacher"}/${testId}/attempts`), enabled: !!testId }); }
export function useGradeTestAttempt() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ attemptId, marks, feedback }: { attemptId: string; marks: number; feedback?: string }) => jsonRequest<ProctoredAttempt>(`/tests/teacher/attempts/${attemptId}/grade`, "POST", { marks, feedback }), onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "test-attempts"] }) }); }
export function useStartTest() { const qc = useQueryClient(); return useMutation({ mutationFn: (testId: string) => jsonRequest<ProctoredAttempt>(`/tests/student/${testId}/start`, "POST"), onSuccess: () => qc.invalidateQueries({ queryKey: ["student-proctored-tests"] }) }); }
export function useSaveTestAnswers() { return useMutation({ mutationFn: ({ attemptId, answers }: { attemptId: string; answers: { questionId: string; selectedOption: string | null }[] }) => jsonRequest<ProctoredAttempt>(`/tests/student/attempts/${attemptId}/answers`, "PUT", { answers }) }); }
export function useSubmitTest() { const qc = useQueryClient(); return useMutation({ mutationFn: (attemptId: string) => jsonRequest<ProctoredAttempt>(`/tests/student/attempts/${attemptId}/submit`, "POST"), onSuccess: () => qc.invalidateQueries({ queryKey: ["student-proctored-tests"] }) }); }
export function useProctorEvent() { return useMutation({ mutationFn: ({ attemptId, type }: { attemptId: string; type: string }) => jsonRequest<{ locked: boolean; violationCount?: number; attempt?: ProctoredAttempt }>(`/tests/student/attempts/${attemptId}/events`, "POST", { type }) }); }
