import { NavLink, Route, Routes } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage";
import { LivePage } from "./pages/LivePage";
import { AdminPage } from "./pages/AdminPage";

export function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <NavLink to="/" end>Feed</NavLink>
        <NavLink to="/live">Live</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/live" element={<LivePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}
