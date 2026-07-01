import { useEffect, useRef, useState } from "react";
import { WS_BASE } from "../api/client";

export function useWebSocket<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    let ws: WebSocket;
    let closedByUs = false;

    const connect = () => {
      ws = new WebSocket(`${WS_BASE}${path}`);
      ws.onmessage = (event) => {
        attemptRef.current = 0;
        setData(JSON.parse(event.data));
      };
      ws.onclose = () => {
        if (closedByUs) return;
        const delay = Math.min(1000 * 2 ** attemptRef.current, 15000);
        attemptRef.current += 1;
        setTimeout(connect, delay);
      };
    };
    connect();

    return () => { closedByUs = true; ws.close(); };
  }, [path]);

  return data;
}
