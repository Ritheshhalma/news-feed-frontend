import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useArticles(params: { category_id?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: async () => (await api.get("/articles/", { params })).data,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories/")).data.results,
  });
}
