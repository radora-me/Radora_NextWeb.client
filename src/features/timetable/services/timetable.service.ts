import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";

export type MineTimetable = {
  name: string;
  className: string;
  section: string;
  isPublished: boolean;
  entries: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    subject: string;
    room?: string | null;
    teacherName?: string | null;
  }>;
  courses: Array<{ courseId: string; className: string; section: string; teacherName?: string | null }>;
};

export type AdminTimetable = MineTimetable & {
  id: string;
  assignments: Array<{ courseId: string; course: { id: string; title: string; description?: string | null } }>;
};

export function useMyTimetables() {
  return useQuery<MineTimetable[]>({
    queryKey: ["my-timetables"],
    queryFn: () => fetchJsonWithAuth<MineTimetable[]>("/timetables/me"),
    staleTime: 60_000,
  });
}

export function useAdminTimetables() {
  return useQuery<AdminTimetable[]>({
    queryKey: ["admin-timetables"],
    queryFn: () => fetchJsonWithAuth<AdminTimetable[]>("/timetables/admin"),
    staleTime: 30_000,
  });
}
