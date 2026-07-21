import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import { DashboardHoliday } from "@/types/api.types";

/**
 * Fetch holidays using the appropriate endpoint for the caller's role.
 *
 * - admin  → GET /auth/admin/holidays
 * - teacher → GET /teacher/attendance/holidays
 * - student / unauthenticated → disabled (returns empty array)
 *
 * Pass `role` from `useAuth()` so the hook never calls an
 * endpoint the current user is not authorised to use.
 */
export function useHolidays(role: "admin" | "teacher" | "student" | undefined) {
  const endpoint =
    role === "admin"
      ? "/auth/admin/holidays"
      : role === "teacher"
      ? "/teacher/attendance/holidays"
      : null;

  return useQuery<DashboardHoliday[]>({
    queryKey: ["holidays", role],
    queryFn: () => fetchJsonWithAuth<DashboardHoliday[]>(endpoint!),
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000, // holidays rarely change
  });
}

/**
 * @deprecated Use `useHolidays(role)` instead.
 * This alias is kept to avoid breaking any existing imports.
 */
export function useAdminHolidays() {
  return useHolidays("admin");
}
