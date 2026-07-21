import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import { NoticeAttachment } from "@/types/api.types";
import { Notice } from "@/types/api.types";

export function useNotices() {
  return useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: () => fetchJsonWithAuth<Notice[]>("/notices"),
  });
}

export function useCreateNotice() {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content?: string;
      attachments?: { fileName: string; mimeType: string; base64: string }[];
    }) => {
      const response = await fetchWithAuth("/notices", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create notice");
      }
      return result as Notice;
    },
  });
}

export function useDeleteNotice() {
  return useMutation({
    mutationFn: async (noticeId: string) => {
      const response = await fetchWithAuth(`/notices/${noticeId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.message || "Failed to delete notice");
      }
    },
  });
}
