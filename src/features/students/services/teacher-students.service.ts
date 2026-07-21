import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { TeacherCourse } from "@/types/api.types";
import { TeacherStudent } from "@/types/api.types";
import { TeacherFoundStudent } from "@/types/api.types";
import { StudentProfileData } from "@/types/api.types";

export function useTeacherStudents() {
  return useQuery<TeacherStudent[]>({
    queryKey: ["teacher-students"],
    queryFn: () => fetchJsonWithAuth<TeacherStudent[]>("/teacher/students"),
  });
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

export function useTeacherDeepStudentProfile(rollNumber: string | null) {
  return useQuery<StudentProfileData>({
    queryKey: ["teacher-deep-student-profile", rollNumber],
    queryFn: () =>
      fetchJsonWithAuth<StudentProfileData>(
        `/teacher/students/by-roll/${encodeURIComponent(rollNumber!.trim())}/profile`
      ),
    enabled: !!rollNumber?.trim(),
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rollNumber,
      data,
    }: {
      rollNumber: string;
      data: Partial<StudentProfileData>;
    }) => {
      const res = await fetchWithAuth(
        `/teacher/students/by-roll/${encodeURIComponent(rollNumber.trim())}/profile`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Failed to update profile");
      return json;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-deep-student-profile", variables.rollNumber],
      });
    },
  });
}
