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
    mutationFn: (payload: { portal_name: string; url: string; source_type: string }) =>
      api.post("/sources/", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useRefreshSource() {
  return useMutation({
    mutationFn: (sourceId: string) => api.post(`/sources/${sourceId}/refresh/`),
  });
}
