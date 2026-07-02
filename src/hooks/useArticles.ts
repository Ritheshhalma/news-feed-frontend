import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

interface ArticlesParams {
  category_id?: string;
  source?: string;
  search?: string;
  page?: number;
  is_live?: boolean;
}

export function useArticles(params: ArticlesParams) {
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

export function useSources() {
  return useQuery({
    queryKey: ["sources"],
    queryFn: async () => (await api.get("/sources/")).data.results,
  });
}
