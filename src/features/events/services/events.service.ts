import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";
import type { SchoolEvent } from "@/types/api.types";

const QK = "events";

export function useEvents() {
  return useQuery<SchoolEvent[]>({ queryKey: [QK], queryFn: () => fetchJsonWithAuth("/events"), staleTime: 30_000 });
}

export function useEvent(id: string) {
  return useQuery<SchoolEvent>({ queryKey: [QK, id], queryFn: () => fetchJsonWithAuth(`/events/${id}`), enabled: !!id });
}

function invalidate(client: ReturnType<typeof useQueryClient>) {
  client.invalidateQueries({ queryKey: [QK] });
}

export function useCreateEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      location?: string;
      startDate: string;
      endDate?: string;
      status?: string;
      media?: { fileName: string; mimeType: string; base64: string; caption?: string }[];
    }) => {
      const res = await fetchWithAuth("/events", { method: "POST", body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create event");
      return json as SchoolEvent;
    },
    onSuccess: () => invalidate(client),
  });
}

export function useUpdateEventStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetchWithAuth(`/events/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      return json as SchoolEvent;
    },
    onSuccess: () => invalidate(client),
  });
}

export function useAddEventMedia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, media }: { id: string; media: { fileName: string; mimeType: string; base64: string; caption?: string }[] }) => {
      const res = await fetchWithAuth(`/events/${id}/media`, { method: "POST", body: JSON.stringify({ media }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload media");
      return json as SchoolEvent;
    },
    onSuccess: () => invalidate(client),
  });
}

export function useRemoveEventMedia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, mediaId }: { eventId: string; mediaId: string }) => {
      const res = await fetchWithAuth(`/events/${eventId}/media/${mediaId}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed to remove media"); }
    },
    onSuccess: () => invalidate(client),
  });
}

export function useDeleteEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/events/${id}`, { method: "DELETE" });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Failed to delete event"); }
    },
    onSuccess: () => invalidate(client),
  });
}
