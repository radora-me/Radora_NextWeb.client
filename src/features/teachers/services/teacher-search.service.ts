import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import { SearchedTeacher } from "@/types/api.types";

export function useSearchTeacher(email: string, enabled: boolean = true) {
  return useQuery<SearchedTeacher>({
    queryKey: ["admin-search-teacher", email],
    queryFn: () => fetchJsonWithAuth<SearchedTeacher>(`/auth/admin/search-teacher?email=${encodeURIComponent(email)}`),
    enabled: enabled && !!email.trim(),
    retry: false, // Don't retry on 404 (not found)
  });
}
