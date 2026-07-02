import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";

interface Tag      { id: string; name: string }
interface Portal   { id: string; name: string }
interface Category { id: string; name: string }

interface Article {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string | null;
  full_image_url: string | null;
  source_url: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  is_live: boolean;
  portal: Portal | null;
  category: Category | null;
  tags: Tag[];
  author: string | null;
  live_data: Record<string, number> | null;
}

const CAT_COLORS: Record<string, string> = {
  India: "#dc2626", World: "#2563eb", Business: "#16a34a",
  Technology: "#7c3aed", Sports: "#ea580c", Entertainment: "#db2777",
  Opinion: "#0891b2", Health: "#059669", Lifestyle: "#d97706",
  Science: "#6366f1", Education: "#8b5cf6", Videos: "#374151",
  Markets: "#0f766e", Cities: "#78350f",
};

function catColor(name: string | undefined) {
  return name ? (CAT_COLORS[name] ?? "#475569") : "#475569";
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function useLiveRate(article: Article) {
  const [rate, setRate] = useState<number | null>(article.live_data?.rate ?? null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!article.is_live) return;
    api.get(`/articles/${article.id}/live_state/`).then((res) => {
      const r = res.data?.data?.rate;
      if (r != null) setRate(r);
    }).catch(() => {});

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/live/${article.id}/`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try { const d = JSON.parse(e.data); if (d.rate != null) setRate(d.rate); } catch {}
    };
    return () => ws.close();
  }, [article.id, article.is_live]);

  return rate;
}

interface Props { article: Article; featured?: boolean }

export function ArticleCard({ article, featured = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const liveRate = useLiveRate(article);
  const displayImage = article.full_image_url || article.thumbnail_url;
  const date = formatDate(article.published_at || article.created_at);
  const catName = article.category?.name;
  const catBg = catColor(catName);

  if (featured) {
    return (
      <div
        className={`article-card featured${expanded ? " expanded" : ""}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {displayImage && !expanded && (
          <div className="card-image-wrap" style={{ width: "100%", height: 260 }}>
            <img src={displayImage} alt={article.title} />
          </div>
        )}
        <div className="card-body">
          <div className="card-meta-top">
            {catName && (
              <span className="cat-badge" style={{ background: catBg }}>{catName}</span>
            )}
            {article.is_live && (
              <span className="live-badge"><span className="live-dot" />LIVE</span>
            )}
            {article.is_live && liveRate != null && (
              <span className="live-rate-chip">1 USD = ₹{liveRate.toFixed(4)}</span>
            )}
          </div>
          <div className="card-title" style={{ WebkitLineClamp: 3 }}>{article.title}</div>
          {article.tags.length > 0 && (
            <div className="card-tags">
              {article.tags.slice(0, 4).map((t: Tag) => (
                <span key={t.id} className="tag-pill">{t.name}</span>
              ))}
            </div>
          )}
          {article.content && (
            <p className="card-snippet" style={{ WebkitLineClamp: 3 }}>{article.content}</p>
          )}
          <div className="card-meta-bottom">
            {article.portal && <span className="card-source">{article.portal.name}</span>}
            {article.author && <><span className="card-sep">·</span><span>by {article.author}</span></>}
            {date && <><span className="card-sep">·</span><span>{date}</span></>}
          </div>
        </div>
        {expanded && <ExpandedBody article={article} liveRate={liveRate} onCollapse={() => setExpanded(false)} />}
      </div>
    );
  }

  return (
    <div
      className={`article-card${expanded ? " expanded" : ""}`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="card-row">
        {!expanded && (
          <div className="card-image-wrap">
            {article.thumbnail_url
              ? <img src={article.thumbnail_url} alt={article.title} loading="lazy" />
              : <div className="card-img-placeholder">📰</div>
            }
          </div>
        )}
        <div className="card-body">
          <div>
            <div className="card-meta-top">
              {catName && (
                <span className="cat-badge" style={{ background: catBg }}>{catName}</span>
              )}
              {article.is_live && (
                <span className="live-badge"><span className="live-dot" />LIVE</span>
              )}
              {article.is_live && liveRate != null && (
                <span className="live-rate-chip">1 USD = ₹{liveRate.toFixed(4)}</span>
              )}
            </div>
            <div className="card-title">{article.title}</div>
            {article.tags.length > 0 && (
              <div className="card-tags">
                {article.tags.slice(0, 3).map((t: Tag) => (
                  <span key={t.id} className="tag-pill">{t.name}</span>
                ))}
              </div>
            )}
            {!expanded && article.content && (
              <p className="card-snippet">{article.content}</p>
            )}
          </div>
          <div className="card-meta-bottom">
            {article.portal && <span className="card-source">{article.portal.name}</span>}
            {article.author && <><span className="card-sep">·</span><span>by {article.author}</span></>}
            {date && <><span className="card-sep">·</span><span>{date}</span></>}
          </div>
        </div>
      </div>
      {expanded && <ExpandedBody article={article} liveRate={liveRate} onCollapse={() => setExpanded(false)} />}
    </div>
  );
}

function ExpandedBody({
  article, liveRate, onCollapse,
}: { article: Article; liveRate: number | null; onCollapse: () => void }) {
  const displayImage = article.full_image_url || article.thumbnail_url;
  const date = formatDate(article.published_at || article.created_at);
  const catName = article.category?.name;
  const catBg = catColor(catName);

  return (
    <div className="expanded-wrap" onClick={(e) => e.stopPropagation()}>
      {displayImage && (
        <img src={displayImage} alt={article.title} className="expanded-image" />
      )}
      <div className="expanded-meta">
        {article.portal && (
          <span style={{ fontWeight: 700, color: "var(--color-brand)", fontSize: "0.85rem" }}>
            {article.portal.name}
          </span>
        )}
        {catName && (
          <span className="cat-badge" style={{ background: catBg }}>{catName}</span>
        )}
        {article.is_live && liveRate != null && (
          <span className="live-rate-chip" style={{ fontSize: "0.85rem" }}>
            1 USD = ₹{liveRate.toFixed(4)}
          </span>
        )}
        {article.author && <span>by <strong>{article.author}</strong></span>}
        {date && <span>{date}</span>}
      </div>
      {article.content && (
        <p className="expanded-content">{article.content}</p>
      )}
      {article.tags.length > 0 && (
        <div className="tag-list">
          {article.tags.map((t) => (
            <span key={t.id} className="tag-pill">{t.name}</span>
          ))}
        </div>
      )}
      <div className="expanded-footer">
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-original-btn"
          onClick={(e) => e.stopPropagation()}
        >
          Read full article ↗
        </a>
        <button className="collapse-btn" onClick={onCollapse}>▲ Collapse</button>
      </div>
    </div>
  );
}
