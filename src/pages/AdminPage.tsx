import { useState } from "react";
import { useSources, useAddSource, useRefreshSource } from "../hooks/useSources";

const FLOWER_URL = import.meta.env.VITE_FLOWER_URL || "/flower/";

export function AdminPage() {
  const { data: sources, refetch } = useSources();
  const addSource = useAddSource();
  const refreshSource = useRefreshSource();
  const [form, setForm] = useState({ portal_name: "", url: "", source_type: "rss" });

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Add source</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); addSource.mutate(form); }}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}
      >
        <input
          placeholder="Portal name"
          value={form.portal_name}
          onChange={(e) => setForm({ ...form, portal_name: e.target.value })}
        />
        <input
          placeholder="Feed/page URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          style={{ minWidth: "260px" }}
        />
        <select
          value={form.source_type}
          onChange={(e) => setForm({ ...form, source_type: e.target.value })}
        >
          <option value="rss">RSS</option>
          <option value="html">HTML</option>
        </select>
        <button type="submit" disabled={addSource.isPending}>
          {addSource.isPending ? "Adding…" : "Add"}
        </button>
      </form>

      <h2>Sources</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>Portal</th><th>URL</th><th>Type</th><th>Status</th><th>Last fetch</th><th></th>
          </tr>
        </thead>
        <tbody>
          {sources?.map((s: any) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td>{s.portal_name}</td>
              <td style={{ fontSize: "0.8rem", color: "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.url}
              </td>
              <td>{s.source_type}</td>
              <td>
                {s.status}
                {s.error_message && (
                  <span title={s.error_message} style={{ marginLeft: "4px", color: "orange" }}>⚠</span>
                )}
              </td>
              <td>{s.last_fetched_at ?? "never"}</td>
              <td>
                <button
                  onClick={() => refreshSource.mutate(s.id, { onSuccess: () => refetch() })}
                  disabled={refreshSource.isPending}
                >
                  Refresh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "2rem" }}>
        <a href={FLOWER_URL} target="_blank" rel="noopener noreferrer">
          Open Celery dashboard (Flower) →
        </a>
      </p>
    </div>
  );
}
