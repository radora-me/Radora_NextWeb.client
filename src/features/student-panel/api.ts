import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

// ==========================================
// STUDENT DASHBOARD API
// ==========================================

export interface StudentDashboardResponse {
  studentName: string;
  attendancePercentage: number;
  streak: number;
  level: {
    level: number;
    title: string;
    xpToNext: number;
    progress: number;
  };
  fees: {
    status: string;
    amount: number;
    academicYear: string;
  };
  upcomingClasses: any[];
  badges: any[];
  aiTutor: {
    subject: string;
    summary: string;
  };
}

export function useStudentDashboard() {
  return useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard"],
    queryFn: () => fetchJsonWithAuth<StudentDashboardResponse>("/student/dashboard"),
  });
}

// ==========================================
// STUDENT PROFILE API
// ==========================================

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  profilePhotoUrl: string | null;
  attendancePercentage: number;
  streak: number;
  courses: {
    id: string;
    title: string;
    description: string;
  }[];
}

export function useStudentProfile() {
  return useQuery<StudentProfile>({
    queryKey: ["student-profile"],
    queryFn: () => fetchJsonWithAuth<StudentProfile>("/student/profile"),
  });
}

// ==========================================
// STUDENT ATTENDANCE API
// ==========================================

export interface AttendanceRecord {
  id?: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "EXCUSED";
  remarks?: string;
}

export interface StudentAttendanceOverview {
  overallAttendance: number;
  eligibility: string;
  totalClasses: number;
  attendedClasses: number;
  presentClasses: number;
  absentClasses: number;
  leaveClasses: number;
  records: AttendanceRecord[];
  holidays: {
    id: string;
    title: string;
    date: string;
  }[];
}

export function useStudentAttendance() {
  return useQuery<StudentAttendanceOverview>({
    queryKey: ["student-attendance-overview"],
    queryFn: () => fetchJsonWithAuth<StudentAttendanceOverview>("/student/attendance/overview"),
  });
}

export function useApplyLeave() {
  return useMutation({
    mutationFn: async (data: { fromDate: string; toDate: string; reason: string }) => {
      const response = await fetchWithAuth("/student/attendance/leave/apply", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to apply for leave");
      }
      return result;
    },
  });
}

export interface LeaveRecord {
  id: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export function useLeaveHistory() {
  return useQuery<LeaveRecord[]>({
    queryKey: ["student-leave-history"],
    queryFn: () => fetchJsonWithAuth<LeaveRecord[]>("/student/attendance/leave/history"),
  });
}

// ==========================================
// STUDENT AI TUTOR API
// ==========================================

export interface AiTutorContextResponse {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    className: string;
    section: string;
    courses: { id: string; title: string }[];
  };
  attendance: {
    overallAttendance: number;
    presentClasses: number;
    absentClasses: number;
    leaveClasses: number;
    streak: number;
    recentRecords: { date: string; status: string; subject: string }[];
  };
  suggestedPrompts: string[];
}

export interface AiTutorChatResponse {
  reply: string;
  usedFallback: boolean;
  fallbackReason?: string;
  cached: boolean;
  context: AiTutorContextResponse;
  suggestedPrompts: string[];
}

export function useAiTutorContext() {
  return useQuery<AiTutorContextResponse>({
    queryKey: ["student-ai-tutor-context"],
    queryFn: () => fetchJsonWithAuth<AiTutorContextResponse>("/student/ai/tutor/context"),
  });
}

export function useSendAiMessage() {
  return useMutation({
    mutationFn: async (data: { message: string; history: { role: "user" | "assistant"; content: string }[] }) => {
      const response = await fetchWithAuth("/student/ai/tutor/chat", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to send message to AI Tutor");
      }
      return result as AiTutorChatResponse;
    },
  });
}

// ==========================================
// STUDENT HOMEWORK API
// ==========================================

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
