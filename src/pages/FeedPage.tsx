import { useState } from "react";
import { useArticles, useCategories, useSources } from "../hooks/useArticles";
import { ArticleCard } from "../components/ArticleCard";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ width: 160, height: 110, flexShrink: 0, borderRadius: 6 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div className="skeleton" style={{ height: 18, width: "90%" }} />
        <div className="skeleton" style={{ height: 18, width: "75%" }} />
        <div className="skeleton" style={{ height: 12, width: "55%", marginTop: "auto" }} />
      </div>
    </div>
  );
}

export function FeedPage() {
  const [categoryId, setCategoryId] = useState("");
  const [sourceId, setSourceId]     = useState("");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);

  const { data: categories } = useCategories();
  const { data: sources }    = useSources();
  const { data, isLoading }  = useArticles({
    category_id: categoryId || undefined,
    source: sourceId || undefined,
    search: search || undefined,
    page,
  });

  const totalPages = data ? Math.ceil(data.count / 20) : 1;

  function selectCategory(id: string) {
    setCategoryId(id);
    setPage(1);
  }

  return (
    <div className="page-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-card">
          <p className="sidebar-title">Categories</p>
          <button
            className={`sidebar-filter-btn${categoryId === "" ? " active" : ""}`}
            onClick={() => selectCategory("")}
          >
            All News
            <span className="sidebar-count">{data?.count ?? "—"}</span>
          </button>
          {categories?.map((c: { id: string; name: string }) => (
            <button
              key={c.id}
              className={`sidebar-filter-btn${categoryId === c.id ? " active" : ""}`}
              onClick={() => selectCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="sidebar-card">
          <p className="sidebar-title">Sources</p>
          <button
            className={`sidebar-filter-btn${sourceId === "" ? " active" : ""}`}
            onClick={() => { setSourceId(""); setPage(1); }}
          >
            All sources
          </button>
          {sources?.map((s: { id: string; portal: string; portal_name: string }) => (
            <button
              key={s.id}
              className={`sidebar-filter-btn${sourceId === s.portal ? " active" : ""}`}
              onClick={() => { setSourceId(s.portal); setPage(1); }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <span className="source-dot" />
                {s.portal_name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="feed-main">
        {/* Toolbar */}
        <div className="feed-toolbar">
          <input
            className="search-input"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="source-select"
            value={sourceId}
            onChange={(e) => { setSourceId(e.target.value); setPage(1); }}
          >
            <option value="">All sources</option>
            {sources?.map((s: { id: string; portal: string; portal_name: string }) => (
              <option key={s.id} value={s.portal}>{s.portal_name}</option>
            ))}
          </select>
          {data && (
            <span className="feed-meta">{data.count.toLocaleString()} article{data.count !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Articles */}
        <div className="article-list">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : data?.results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p className="empty-state-title">No articles found</p>
              <p className="empty-state-sub">Try adjusting your search or filters</p>
            </div>
          ) : (
            data?.results.map((a: any, i: number) => (
              <ArticleCard key={a.id} article={a} featured={i === 0 && page === 1 && !search && !categoryId && !sourceId} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >«</button>
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >‹ Prev</button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >Next ›</button>
            <button
              className="page-btn"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >»</button>
          </div>
        )}
      </main>
    </div>
  );
}
