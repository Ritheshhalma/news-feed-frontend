import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api/v1",
});

export const WS_BASE = import.meta.env.VITE_WS_BASE || `ws://${window.location.host}`;
