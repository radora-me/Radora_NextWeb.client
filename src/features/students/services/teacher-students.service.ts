import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export interface TeacherCourse {
  id: string;
  title: string;
  description: string; // section (e.g. "A")
}

export interface TeacherStudent {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  profilePhotoUrl: string | null;
  courses: TeacherCourse[];
  addedAt: string;
}

export function useTeacherStudents() {
  return useQuery<TeacherStudent[]>({
    queryKey: ["teacher-students"],
    queryFn: () => fetchJsonWithAuth<TeacherStudent[]>("/teacher/students"),
  });
}

export interface TeacherFoundStudent {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  profilePhotoUrl: string | null;
  courses: TeacherCourse[];
  existingTeacherIds: string[];
}

export function useTeacherSearchStudent(rollNumber: string, enabled: boolean = true) {
  return useQuery<TeacherFoundStudent>({
    queryKey: ["teacher-search-student", rollNumber],
    queryFn: () =>
      fetchJsonWithAuth<TeacherFoundStudent>(
        `/teacher/students/by-roll/${encodeURIComponent(rollNumber.trim())}`
      ),
    enabled: enabled && !!rollNumber.trim(),
    retry: false,
  });
}

export function useTeacherAddStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rollNumber,
      courseIds,
    }: {
      rollNumber: string;
      courseIds: string[];
    }) => {
      const res = await fetchWithAuth(
        `/teacher/students/by-roll/${encodeURIComponent(rollNumber.trim())}`,
        {
          method: "PUT",
          body: JSON.stringify({ courseIds }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to add student");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-students"] });
    },
  });
}
