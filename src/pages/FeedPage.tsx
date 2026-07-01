import { useState } from "react";
import { useArticles, useCategories } from "../hooks/useArticles";
import { ArticleCard } from "../components/ArticleCard";

export function FeedPage() {
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const { data: categories } = useCategories();
  const { data, isLoading } = useArticles({
    category_id: categoryId || undefined,
    search: search || undefined,
  });

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All categories</option>
          {categories?.map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        data?.results.map((a: any) => <ArticleCard key={a.id} article={a} />)
      )}
    </div>
  );
}
