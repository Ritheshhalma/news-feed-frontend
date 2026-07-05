import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: async () => (await api.get("/sources/")).data.results,
  });
}

export function useAddSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { portal_name: string; url: string }) =>
      api.post("/sources/", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useRefreshSource() {
  return useMutation({
    mutationFn: (sourceId: string) =>
      api.post(`/sources/${sourceId}/refresh/`, { force: true }),
  });
}

export function useResyncSource() {
  return useMutation({
    mutationFn: (sourceId: string) => api.post(`/sources/${sourceId}/resync/`),
  });
}

// Polls a dispatched refresh/resync task until its SourceFetchLog leaves
// "started", so the UI can stay disabled for the task's real duration
// instead of just the POST's network round-trip.
export function useJobStatus(taskId: string | null) {
  return useQuery({
    queryKey: ["job-status", taskId],
    queryFn: async () => (await api.get(`/jobs/${taskId}/`)).data,
    enabled: !!taskId,
    refetchInterval: (query) => {
      const logs = query.state.data as any[] | undefined;
      if (!logs || logs.length === 0) return 2000;
      return logs[0].status === "started" ? 2000 : false;
    },
  });
}
