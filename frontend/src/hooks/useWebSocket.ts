import { useEffect, useRef, useCallback } from "react";
import { useTickerStore } from "../store/tickerStore";
import type { TickerTick } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL || "";
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 30000;

const ALL_SYMBOLS = ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "GOOGL"];

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const { applyTick, setTickers, setConnected } = useTickerStore();

  const clearPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const startPing = useCallback((ws: WebSocket) => {
    clearPing();
    pingIntervalRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, PING_INTERVAL_MS);
  }, [clearPing]);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    const wsBase = WS_URL || window.location.origin.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isMountedRef.current) return;
      reconnectCountRef.current = 0;
      setConnected(true);
      // Subscribe to all symbols
      ws.send(
        JSON.stringify({ type: "subscribe", symbols: ALL_SYMBOLS })
      );
      startPing(ws);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === "tick") {
          applyTick(message as TickerTick);
        } else if (message.type === "subscribed" && Array.isArray(message.snapshots)) {
          // Seed initial ticker state from subscription snapshot
          setTickers(message.snapshots);
        }
        // pong and other control messages are silently ignored
      } catch {
        // Malformed JSON — ignore
      }
    };

    ws.onclose = () => {
      clearPing();
      if (!isMountedRef.current) return;
      setConnected(false);
      if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectCountRef.current++;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [applyTick, setTickers, setConnected, startPing, clearPing]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearPing();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount close
        wsRef.current.close();
      }
      setConnected(false);
    };
  }, [connect, clearPing, setConnected]);
}
