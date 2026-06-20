import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

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
