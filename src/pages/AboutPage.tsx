const STACK = [
  { layer: "API", tool: "Django 5 + Django REST Framework" },
  { layer: "Task queue", tool: "Celery + RabbitMQ" },
  { layer: "Database", tool: "PostgreSQL" },
  { layer: "Cache / channel layer", tool: "Redis" },
  { layer: "Real-time", tool: "Django Channels (WebSocket)" },
  { layer: "LLM cleaning", tool: "DeepSeek (chat completions API)" },
  { layer: "JS rendering", tool: "Playwright + Camoufox (hardened Firefox)" },
  { layer: "Deploy", tool: "Docker Compose + nginx + Let's Encrypt" },
];

export function AboutPage() {
  return (
    <div className="admin-page">
      <h1 className="admin-page-title">About</h1>

      <section className="about-section">
        <p className="admin-section-title">Overview</p>
        <p className="about-text">
          NewsFeed is a multi-source news aggregator that scrapes RSS feeds, static HTML
          pages, and JavaScript-rendered sites into a single deduplicated feed, cleans up
          scraped content with an LLM pass, and tracks live market data (forex/stock rates)
          over WebSocket without any client-side polling.
        </p>
      </section>

      <section className="about-section">
        <p className="admin-section-title">Architecture &amp; Tech Stack</p>
        <table className="data-table">
          <thead>
            <tr><th>Layer</th><th>Tool</th></tr>
          </thead>
          <tbody>
            {STACK.map((row) => (
              <tr key={row.layer}>
                <td style={{ fontWeight: 600 }}>{row.layer}</td>
                <td>{row.tool}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="about-section">
        <p className="admin-section-title">Backend Workflow</p>
        <p className="about-text">
          The backend is the primary focus of this project. Every article passes through
          the same pipeline regardless of where it came from:
        </p>
        <ul className="about-list">
          <li>
            <strong>Five source/parser combinations</strong> — <code>rss</code> (summary
            only), <code>rss/multistage</code> (RSS + a Stage 2 <code>trafilatura</code>{" "}
            full-body fetch), <code>html</code> (BeautifulSoup listing-card scrape),{" "}
            <code>html/multistage</code> (listing + Stage 2 full-body), and{" "}
            <code>js/playwright</code> (Camoufox-rendered pages for JavaScript-heavy sites
            like BBC's Next.js frontend).
          </li>
          <li>
            <strong>Deduplication</strong> — <code>hashed_key</code> (a hash of the
            normalized title) identifies the same story across re-scrapes;{" "}
            <code>content_hash</code> (a hash of the body) detects when the underlying
            content actually changed versus a no-op re-scrape.
          </li>
          <li>
            <strong>LLM cleaning</strong> — the <code>clean_article_llm</code> Celery task
            sends new or changed articles to DeepSeek to strip scraping artifacts from the
            title/body and classify the article into a category. Retried with exponential
            backoff up to 3 times, then routed to a dead-letter queue.
          </li>
          <li>
            <strong>Live-poll</strong> — articles marked <code>is_live</code> (forex via
            x-rates.com, stock via Yahoo Finance) are re-fetched every ~15 seconds and
            pushed to connected clients over WebSocket — the Live tab never polls.
          </li>
          <li>
            <strong>Queue routing</strong> — <code>scrape.scheduled</code>,{" "}
            <code>scrape.ondemand</code>, <code>scrape.playwright</code>,{" "}
            <code>media.process</code>, <code>live.poll</code>, and <code>llm.clean</code>{" "}
            each run on their own worker/concurrency, with <code>acks_late=True</code> and a
            dead-letter requeue command for permanently failed tasks.
          </li>
        </ul>
      </section>
    </div>
  );
}
