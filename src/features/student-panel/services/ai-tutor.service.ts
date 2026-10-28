import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { AiTutorContextResponse } from "@/types/api.types";
import { AiTutorChatResponse } from "@/types/api.types";

export function useAiTutorContext() {
  return useQuery<AiTutorContextResponse>({
    queryKey: ["student-ai-tutor-context"],
    queryFn: () => fetchJsonWithAuth<AiTutorContextResponse>("/student/ai/tutor/context"),
  });
}

export function useSendAiMessage() {
  return useMutation({
    mutationFn: async (data: {
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
      onToken?: (text: string) => void;
    }) => {
      const { onToken, ...requestData } = data;
      const response = await fetchWithAuth("/student/ai/tutor/chat/stream", {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let result: { error?: string; message?: string } = {};
        try {
          result = await response.json();
        } catch {
          // Fall through to the generic error below.
        }
        throw new Error(result.error || result.message || "Failed to send message to AI Tutor");
      }

      if (!response.body) {
        throw new Error("The AI Tutor stream was not available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      let usedFallback = false;
      let cached = false;

      const consumeLine = (line: string) => {
        if (!line.startsWith("data:")) return;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;

        let event: {
          type?: "token" | "done" | "error";
          text?: string;
          error?: string;
          usedFallback?: boolean;
          cached?: boolean;
        };

        try {
          event = JSON.parse(payload);
        } catch {
          return;
        }

        if (event.type === "token" && event.text) {
          reply += event.text;
          onToken?.(event.text);
        } else if (event.type === "done") {
          usedFallback = Boolean(event.usedFallback);
          cached = Boolean(event.cached);
        } else if (event.type === "error") {
          throw new Error(event.error || "Failed to stream AI Tutor response");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";
        lines.forEach(consumeLine);
        if (done) break;
      }

      if (buffer.trim()) consumeLine(buffer.trim());

      return {
        reply,
        usedFallback,
        cached,
      } as AiTutorChatResponse;
    },
  });
}
