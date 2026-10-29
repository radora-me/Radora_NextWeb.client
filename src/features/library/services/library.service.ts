import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import type { Book, BookIssueRecord, LibraryAdminOverview, LibrarianProfile, StudentLibraryOverview } from "@/types/api.types";

const QK_BOOKS = "library-books";
const QK_ISSUES = "library-issues";
const QK_OVERVIEW = "library-admin-overview";
const QK_LIBRARIANS = "librarians";
const QK_STUDENT_LIBRARY = "student-library";

function invalidate(client: ReturnType<typeof useQueryClient>, keys: string[]) {
  keys.forEach((k) => client.invalidateQueries({ queryKey: [k] }));
}

// ── Books ─────────────────────────────────────────────────────────────────────
export function useBooks() {
  return useQuery<Book[]>({ queryKey: [QK_BOOKS], queryFn: () => fetchJsonWithAuth("/library/books"), staleTime: 30_000 });
}

export function useBookByQR(qrBookId: string, enabled = false) {
  return useQuery<Book>({ queryKey: [QK_BOOKS, "qr", qrBookId], queryFn: () => fetchJsonWithAuth(`/library/books/qr/${qrBookId}`), enabled });
}

export function useAddBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; author?: string; publisher?: string; isbn?: string; category?: string; totalCopies?: number; bookId?: string }) => {
      const res = await fetchWithAuth("/library/books", { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add book");
      return json as Book;
    },
    onSuccess: () => invalidate(client, [QK_BOOKS]),
  });
}

export function useRegenerateQR() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/library/books/${id}/qr`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to regenerate QR");
      return json as Book;
    },
    onSuccess: () => invalidate(client, [QK_BOOKS]),
  });
}

export function useDeleteBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/library/books/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed to delete book"); }
    },
    onSuccess: () => invalidate(client, [QK_BOOKS]),
  });
}

// ── Issues ────────────────────────────────────────────────────────────────────
export function useIssues(filters?: { status?: string }) {
  const params = filters?.status ? `?status=${filters.status}` : "";
  return useQuery<BookIssueRecord[]>({ queryKey: [QK_ISSUES, filters], queryFn: () => fetchJsonWithAuth(`/library/issues${params}`), staleTime: 15_000 });
}

export function useIssueBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (data: { qrBookId: string; studentRollNumber: string; dueDate?: string; notes?: string }) => {
      const res = await fetchWithAuth("/library/issues", { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to issue book");
      return json as BookIssueRecord;
    },
    onSuccess: () => invalidate(client, [QK_BOOKS, QK_ISSUES, QK_OVERVIEW]),
  });
}

export function useReturnBook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, status, notes }: { issueId: string; status?: string; notes?: string }) => {
      const res = await fetchWithAuth(`/library/issues/${issueId}/return`, { method: "PATCH", body: JSON.stringify({ status, notes }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to return book");
      return json as BookIssueRecord;
    },
    onSuccess: () => invalidate(client, [QK_BOOKS, QK_ISSUES, QK_OVERVIEW]),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export function useLibraryAdminOverview() {
  return useQuery<LibraryAdminOverview>({ queryKey: [QK_OVERVIEW], queryFn: () => fetchJsonWithAuth("/library/admin/overview"), staleTime: 30_000 });
}

export function useAdminIssues() {
  return useQuery<BookIssueRecord[]>({ queryKey: [QK_ISSUES, "admin"], queryFn: () => fetchJsonWithAuth("/library/admin/issues"), staleTime: 30_000 });
}

export function useLibrarians() {
  return useQuery<LibrarianProfile[]>({ queryKey: [QK_LIBRARIANS], queryFn: () => fetchJsonWithAuth("/auth/admin/librarians"), staleTime: 60_000 });
}

export function useCreateLibrarian() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await fetchWithAuth("/auth/admin/create-librarian", { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create librarian");
      return json;
    },
    onSuccess: () => invalidate(client, [QK_LIBRARIANS]),
  });
}

export function useDeleteLibrarian() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/auth/admin/librarians/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed to delete librarian"); }
    },
    onSuccess: () => invalidate(client, [QK_LIBRARIANS]),
  });
}


// ── Student ───────────────────────────────────────────────────────────────────
export function useStudentLibrary() {
  return useQuery<StudentLibraryOverview>({
    queryKey: [QK_STUDENT_LIBRARY],
    queryFn: () => fetchJsonWithAuth("/library/student/my-issues"),
    staleTime: 30_000,
  });
}
