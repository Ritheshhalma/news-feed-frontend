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
    </div>
  );
}
