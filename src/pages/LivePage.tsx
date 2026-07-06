import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

// ── Hook: manages full live data dict + connected status ───────────────────────
function useLiveCardState(article: any) {
  const [data, setData] = useState<Record<string, any> | null>(article.live_data ?? null);
  const [connected, setConnected] = useState(article.live_data != null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let closedByUs = false;
    let attempt = 0;

    api.get(`/articles/${article.id}/live_state/`).then((res) => {
      const d = res.data?.data;
      if (d && Object.keys(d).length > 0) { setData(d); setConnected(true); }
    }).catch(() => {});

    const proto = window.location.protocol === "https:" ? "wss" : "ws";

    const connect = () => {
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/live/${article.id}/`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          if (d && Object.keys(d).length > 0) { setData(d); setConnected(true); }
        } catch {}
      };
      ws.onclose = () => {
        setConnected(false);
        if (closedByUs) return;
        const delay = Math.min(1000 * 2 ** attempt, 15000);
        attempt += 1;
        setTimeout(connect, delay);
      };
    };
    connect();

    return () => { closedByUs = true; wsRef.current?.close(); };
  }, [article.id]);

  return { data, connected };
}

// ── Forex card body ────────────────────────────────────────────────────────────
function ForexDisplay({ data }: { data: Record<string, any> | null }) {
  const rate: number | null = data?.rate ?? null;
  return (
    <>
      <div className="live-card-rate">
        {rate != null ? (
          <>₹{rate.toFixed(2)}<span className="live-card-currency">INR</span></>
        ) : (
          <span style={{ color: "var(--color-faint)", fontSize: "1.5rem" }}>—</span>
        )}
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 4 }}>
        1 USD = ₹{rate != null ? rate.toFixed(6) : "…"}
        {data?.change_pct != null && (
          <span style={{ marginLeft: 8, color: data.change_pct >= 0 ? "#16a34a" : "#dc2626" }}>
            {data.change_pct >= 0 ? "▲" : "▼"} {Math.abs(data.change_pct).toFixed(2)}%
          </span>
        )}
      </div>
    </>
  );
}

// ── Stock card body ────────────────────────────────────────────────────────────
function StockDisplay({ data }: { data: Record<string, any> | null }) {
  const price: number | null = data?.price ?? null;
  const change: number | null = data?.change ?? null;
  const changePct: number | null = data?.change_pct ?? null;
  const isUp = change != null ? change >= 0 : null;
  const symbol = data?.currency === "INR" ? "₹" : (data?.currency ?? "");

  return (
    <>
      <div className="live-card-rate">
        {price != null ? (
          <>
            {symbol}{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="live-card-currency">{data?.currency ?? ""}</span>
          </>
        ) : (
          <span style={{ color: "var(--color-faint)", fontSize: "1.5rem" }}>—</span>
        )}
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {data?.symbol && <span style={{ fontWeight: 700, color: "var(--color-text)" }}>{data.symbol}</span>}
        {change != null && changePct != null && (
          <span style={{ color: isUp ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
            {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)} ({Math.abs(changePct).toFixed(2)}%)
          </span>
        )}
        {data?.market_state && (
          <span style={{
            background: data.market_state === "REGULAR" ? "#dcfce7" : "#fef9c3",
            color: data.market_state === "REGULAR" ? "#15803d" : "#854d0e",
            padding: "1px 6px", borderRadius: 3, fontSize: "0.7rem", fontWeight: 600,
          }}>
            {data.market_state}
          </span>
        )}
      </div>
      {(data?.exchange || data?.prev_close != null) && (
        <div style={{ fontSize: "0.72rem", color: "var(--color-faint)", marginTop: 2 }}>
          {data?.exchange ?? ""}{data?.prev_close != null ? ` · Prev close: ₹${(data.prev_close as number).toFixed(2)}` : ""}
        </div>
      )}
    </>
  );
}

// ── LiveCard ───────────────────────────────────────────────────────────────────
function LiveCard({ article }: { article: any }) {
  const { data, connected } = useLiveCardState(article);
  const pollType: string = article.poll_type || "forex";

  return (
    <div className="live-card">
      <div className="live-card-label">
        <span className="live-badge" style={{ fontSize: "0.62rem" }}>
          <span className="live-dot" />LIVE
        </span>
        {article.portal?.name && (
          <span style={{ color: "var(--color-faint)" }}>{article.portal.name}</span>
        )}
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px",
          background: pollType === "stock" ? "#eff6ff" : "#f0fdf4",
          color: pollType === "stock" ? "#1d4ed8" : "#15803d",
          borderRadius: 3, marginLeft: "auto",
        }}>
          {pollType.toUpperCase()}
        </span>
      </div>

      <div className="live-card-title">{article.title}</div>

      {pollType === "stock"
        ? <StockDisplay data={data} />
        : <ForexDisplay data={data} />}

      <div className={`live-card-status${connected ? " connected" : ""}`}>
        {connected ? "● Receiving live updates" : "◎ Connecting to feed…"}
      </div>
      <a
        href={article.source_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block", marginTop: "1rem", fontSize: "0.78rem",
          color: "var(--color-brand)", fontWeight: 600,
        }}
      >
        View source ↗
      </a>
    </div>
  );
}

// ── LivePage ───────────────────────────────────────────────────────────────────
export function LivePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["live-articles"],
    queryFn: async () => (await api.get("/articles/", { params: { is_live: true } })).data,
    refetchInterval: 30_000,
  });

  return (
    <div className="live-page">
      <h1 className="live-page-title">Live Markets</h1>
      <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Real-time data updated every 15 seconds via WebSocket
      </p>

      {isLoading && (
        <div className="live-grid">
          {[1, 2].map((i) => (
            <div key={i} className="live-card" style={{ minHeight: 180 }}>
              <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 18, width: "80%", marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 48, width: "50%" }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && data?.results.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <p className="empty-state-title">No live feeds configured</p>
          <p className="empty-state-sub">Add a live article source from the Admin panel</p>
        </div>
      )}

      <div className="live-grid">
        {data?.results.map((a: any) => <LiveCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}
