import { useState } from "react";
import { useSources, useAddSource, useRefreshSource } from "../hooks/useSources";

const FLOWER_URL = import.meta.env.VITE_FLOWER_URL || "http://localhost:5555";
const SWAGGER_URL = "/api/schema/swagger-ui/";
const DJANGO_ADMIN_URL = "/admin/";

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function AdminPage() {
  const { data: sources, refetch } = useSources();
  const addSource    = useAddSource();
  const refreshSource = useRefreshSource();
  const [form, setForm] = useState({ portal_name: "", url: "", source_type: "rss" });
  const [addedMsg, setAddedMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addSource.mutate(form, {
      onSuccess: () => {
        setForm({ portal_name: "", url: "", source_type: "rss" });
        setAddedMsg("Source added successfully.");
        refetch();
        setTimeout(() => setAddedMsg(""), 3000);
      },
    });
  }

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Admin</h1>

      {/* ── Add source form ── */}
      <p className="admin-section-title">Add News Source</p>
      <form className="add-source-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Portal Name</label>
          <input
            className="form-input"
            placeholder="e.g. BBC News"
            value={form.portal_name}
            onChange={(e) => setForm({ ...form, portal_name: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Feed / Page URL</label>
          <input
            className="form-input wide"
            placeholder="https://example.com/rss or https://news.google.com/rss"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Type</label>
          <select
            className="form-input"
            value={form.source_type}
            onChange={(e) => setForm({ ...form, source_type: e.target.value })}
          >
            <option value="rss">RSS Feed</option>
            <option value="html">HTML Page</option>
          </select>
        </div>
        <button className="btn-primary" type="submit" disabled={addSource.isPending}>
          {addSource.isPending ? "Adding…" : "+ Add Source"}
        </button>
      </form>
      {addedMsg && (
        <p style={{ color: "#16a34a", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1rem" }}>
          ✓ {addedMsg}
        </p>
      )}
      {addSource.isError && (
        <p style={{ color: "var(--color-brand)", fontSize: "0.85rem", marginTop: "-1rem", marginBottom: "1rem" }}>
          ✗ Failed to add source. Check the URL and try again.
        </p>
      )}

      {/* ── Sources table ── */}
      <p className="admin-section-title" style={{ marginTop: "1.5rem" }}>
        Configured Sources ({sources?.length ?? 0})
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Portal</th>
            <th>URL</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Fetched</th>
            <th style={{ width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {(sources ?? []).map((s: any) => (
            <tr key={s.id}>
              <td style={{ fontWeight: 600 }}>{s.portal_name}</td>
              <td>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="table-url" title={s.url}>
                  {s.url}
                </a>
              </td>
              <td>
                <span style={{
                  fontSize: "0.72rem", fontWeight: 600,
                  padding: "2px 8px", borderRadius: 3,
                  background: s.source_type === "rss" ? "#eff6ff" : "#f0fdf4",
                  color: s.source_type === "rss" ? "#1d4ed8" : "#15803d",
                }}>
                  {s.source_type.toUpperCase()}
                </span>
              </td>
              <td>
                <span className={`status-badge ${s.status}`}>
                  {s.status === "active" ? "● Active" : s.status === "failed" ? "✗ Failed" : s.status}
                </span>
                {s.error_message && (
                  <span title={s.error_message} style={{ marginLeft: 6, cursor: "help", color: "#f59e0b" }}>⚠</span>
                )}
              </td>
              <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
                {formatDate(s.last_fetched_at)}
              </td>
              <td>
                <button
                  className="btn-sm"
                  onClick={() => refreshSource.mutate(s.id, { onSuccess: () => refetch() })}
                  disabled={refreshSource.isPending}
                >
                  {refreshSource.isPending ? "…" : "↻ Refresh"}
                </button>
              </td>
            </tr>
          ))}
          {sources?.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "var(--color-muted)", padding: "2rem" }}>
                No sources configured yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Quick links ── */}
      <div className="admin-links">
        <a href={FLOWER_URL} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
          🌸 Celery Flower
        </a>
        <a href={SWAGGER_URL} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
          📖 API Docs (Swagger)
        </a>
        <a href={DJANGO_ADMIN_URL} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
          ⚙️ Django Admin
        </a>
      </div>
    </div>
  );
}
