import { NavLink, Route, Routes } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage";
import { LivePage } from "./pages/LivePage";
import { AdminPage } from "./pages/AdminPage";
import { AboutPage } from "./pages/AboutPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            NEWS<span>FEED</span>
          </div>
          <nav className="header-nav">
            <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Feed
            </NavLink>
            <NavLink to="/live" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Live Markets
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Admin
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              About
            </NavLink>
          </nav>
          <span className="header-tagline">Aggregated · Real-time · Multi-source</span>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}
