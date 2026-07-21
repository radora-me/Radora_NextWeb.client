import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { ChatRoom } from "@/types/api.types";
import { ChatMessage } from "@/types/api.types";
import { RoomMessagesResponse } from "@/types/api.types";

export function useChatRooms() {
  return useQuery<ChatRoom[]>({
    queryKey: ["chat-rooms"],
    queryFn: () => fetchJsonWithAuth<ChatRoom[]>("/chat/rooms"),
  });
}

export function useChatMessages(courseId: string | null) {
  return useQuery<RoomMessagesResponse>({
    queryKey: ["chat-messages", courseId],
    queryFn: () => fetchJsonWithAuth<RoomMessagesResponse>(`/chat/rooms/${courseId}/messages`),
    enabled: !!courseId,
    refetchInterval: 5000, // Poll every 5s for new messages
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ courseId, content }: { courseId: string; content: string }) => {
      const response = await fetchWithAuth(`/chat/rooms/${courseId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to send message");
      }
      return result;
    },
  });
}
