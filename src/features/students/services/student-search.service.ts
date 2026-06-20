import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export interface SearchedStudent {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  profilePhotoUrl: string | null;
  role: string;
}

export function useSearchStudent(rollNumber: string, enabled: boolean = true) {
  return useQuery<SearchedStudent>({
    queryKey: ["admin-search-student", rollNumber],
    queryFn: () => fetchJsonWithAuth<SearchedStudent>(`/auth/admin/search-student?rollNumber=${encodeURIComponent(rollNumber)}`),
    enabled: enabled && !!rollNumber.trim(),
    retry: false, // Don't retry on 404 (not found)
  });
}
