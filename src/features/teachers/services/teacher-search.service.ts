import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface SearchedTeacher {
  id: string;
  name: string;
  email: string;
  courses: {
    id: string;
    title: string;
    description: string;
  }[];
}

export function useSearchTeacher(email: string, enabled: boolean = true) {
  return useQuery<SearchedTeacher>({
    queryKey: ["admin-search-teacher", email],
    queryFn: () => fetchJsonWithAuth<SearchedTeacher>(`/auth/admin/search-teacher?email=${encodeURIComponent(email)}`),
    enabled: enabled && !!email.trim(),
    retry: false, // Don't retry on 404 (not found)
  });
}
