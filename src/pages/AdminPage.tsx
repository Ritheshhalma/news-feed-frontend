import { useEffect, useState } from "react";
import {
  useSources, useAddSource, useRefreshSource, useResyncSource, useJobStatus,
} from "../hooks/useSources";

const FLOWER_URL = import.meta.env.VITE_FLOWER_URL || "http://localhost:5555";
const SWAGGER_URL = "/api/schema/swagger-ui/";
const DJANGO_ADMIN_URL = "/admin/";

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function SourceRow({ source, onChanged }: { source: any; onChanged: () => void }) {
  const refreshSource = useRefreshSource();
  const resyncSource = useResyncSource();
  const [task, setTask] = useState<{ taskId: string; action: "refresh" | "resync" } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const jobStatus = useJobStatus(task?.taskId ?? null);
  const latestLogStatus = (jobStatus.data as any[] | undefined)?.[0]?.status;

  // Stay disabled for the task's real duration, not just the POST round-trip —
  // clear once its SourceFetchLog leaves "started".
  useEffect(() => {
    if (task && latestLogStatus && latestLogStatus !== "started") {
      setTask(null);
      onChanged();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestLogStatus]);

  function showError(err: any, fallback: string) {
    setErrorMsg(err?.response?.data?.detail || fallback);
    setTimeout(() => setErrorMsg(""), 4000);
  }

  function handleRefresh() {
    refreshSource.mutate(source.id, {
      onSuccess: (res) => setTask({ taskId: res.data.task_id, action: "refresh" }),
      onError: (err) => showError(err, "Failed to start refresh."),
    });
  }

  function handleResync() {
    resyncSource.mutate(source.id, {
      onSuccess: (res) => setTask({ taskId: res.data.task_id, action: "resync" }),
      onError: (err) => showError(err, "Failed to start resync."),
    });
  }

  const refreshBusy = refreshSource.isPending || task?.action === "refresh";
  const resyncBusy = resyncSource.isPending || task?.action === "resync";
  const anyBusy = refreshBusy || resyncBusy;

  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{source.portal_name}</td>
      <td>
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="table-url" title={source.url}>
          {source.url}
        </a>
      </td>
      <td>
        <span style={{
          fontSize: "0.72rem", fontWeight: 600,
          padding: "2px 8px", borderRadius: 3,
          background: source.source_type === "rss" ? "#eff6ff" : "#f0fdf4",
          color: source.source_type === "rss" ? "#1d4ed8" : "#15803d",
        }}>
          {source.source_type.toUpperCase()}
        </span>
      </td>
      <td>
        <span className={`status-badge ${source.status}`}>
          {source.status === "active" ? "● Active" : source.status === "failed" ? "✗ Failed" : source.status}
        </span>
        {source.error_message && (
          <span title={source.error_message} style={{ marginLeft: 6, cursor: "help", color: "#f59e0b" }}>⚠</span>
        )}
      </td>
      <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
        {formatDate(source.last_fetched_at)}
        {errorMsg && (
          <div style={{ color: "#dc2626", fontSize: "0.72rem", marginTop: 2 }}>{errorMsg}</div>
        )}
      </td>
      <td>
        <button
          className="btn-sm"
          onClick={handleRefresh}
          disabled={anyBusy}
          title="Discover new articles and update ones still on the listing page"
        >
          {refreshBusy ? "…" : "↻ Refresh"}
        </button>
      </td>
      <td>
        <button
          className="btn-sm"
          onClick={handleResync}
          disabled={anyBusy}
          title="Re-fetch every stored article directly from its own URL — fixes failures/wrong content even for articles no longer on the listing page"
        >
          {resyncBusy ? "…" : "⟳ Resync All"}
        </button>
      </td>
    </tr>
  );
}

export function AdminPage() {
  const { data: sources, refetch } = useSources();
  const addSource = useAddSource();
  const [form, setForm] = useState({ portal_name: "", url: "" });
  const [addedMsg, setAddedMsg] = useState("");

  // "bbc" / "BBC" / " BBC " should all reuse one portal, not fragment into
  // separate rows — the backend already enforces this case-insensitively;
  // this is just a heads-up so the casing choice isn't a surprise.
  const trimmedName = form.portal_name.trim();
  const existingPortalMatch = trimmedName
    ? (sources ?? []).find(
        (s: any) => s.portal_name.toLowerCase() === trimmedName.toLowerCase()
      )
    : null;
  const reusingDifferentCasing =
    existingPortalMatch && existingPortalMatch.portal_name !== trimmedName;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addSource.mutate(form, {
      onSuccess: () => {
        setForm({ portal_name: "", url: "" });
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
          {reusingDifferentCasing && (
            <p style={{ color: "var(--color-muted)", fontSize: "0.72rem", margin: "4px 0 0" }}>
              Will use existing portal "{existingPortalMatch.portal_name}"
            </p>
          )}
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
            <th style={{ width: 100 }}></th>
            <th style={{ width: 130 }}></th>
          </tr>
        </thead>
        <tbody>
          {(sources ?? []).map((s: any) => (
            <SourceRow key={s.id} source={s} onChanged={refetch} />
          ))}
          {sources?.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--color-muted)", padding: "2rem" }}>
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
