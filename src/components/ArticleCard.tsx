import { useState } from "react";

interface Article {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string | null;
  full_image_url: string | null;
  source_url: string;
  portal: { name: string };
  published_at: string | null;
}

export function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false);
  const imgSrc = expanded ? (article.full_image_url || article.thumbnail_url) : article.thumbnail_url;

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.75rem", borderBottom: "1px solid #eee" }}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          onClick={() => setExpanded((v) => !v)}
          style={{ width: expanded ? 320 : 120, height: expanded ? 200 : 80, objectFit: "cover", cursor: "pointer" }}
        />
      )}
      <div>
        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
          <strong>{article.title}</strong>
        </a>
        <div style={{ fontSize: "0.85rem", color: "#666" }}>{article.portal.name}</div>
      </div>
    </div>
  );
}
