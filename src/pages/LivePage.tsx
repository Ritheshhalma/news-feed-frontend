import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { useWebSocket } from "../hooks/useWebSocket";

function LiveCard({ article }: { article: { id: string; title: string } }) {
  const liveData = useWebSocket<{ rate: number }>(`/ws/live/${article.id}/`);
  return (
    <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8, minWidth: "200px" }}>
      <h3 style={{ margin: "0 0 0.5rem" }}>{article.title}</h3>
      <p style={{ fontSize: "2rem", margin: 0, fontVariantNumeric: "tabular-nums" }}>
        {liveData ? liveData.rate.toFixed(2) : "—"}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#999", margin: "0.25rem 0 0" }}>
        {liveData ? "live" : "connecting…"}
      </p>
    </div>
  );
}

export function LivePage() {
  const { data } = useQuery({
    queryKey: ["live-articles"],
    queryFn: async () => (await api.get("/articles/", { params: { is_live: true } })).data,
  });

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Live</h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {data?.results.length === 0 && <p>No live articles configured.</p>}
        {data?.results.map((a: any) => <LiveCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
