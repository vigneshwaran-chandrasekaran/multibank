import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { marketSimulator } from "../services/marketSimulator";
import { WsClientMessage, TickerTick } from "../types";

interface Client {
  ws: WebSocket;
  subscriptions: Set<string>;
  id: string;
}

let clientIdCounter = 0;
const clients = new Map<string, Client>();

function safeSend(ws: WebSocket, data: object): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

export function createWebSocketServer(server: import("http").Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  // Broadcast ticks to subscribed clients
  marketSimulator.on("tick", (tick: TickerTick) => {
    for (const client of clients.values()) {
      if (client.subscriptions.has(tick.symbol)) {
        safeSend(client.ws, tick);
      }
    }
  });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    const clientId = `client_${++clientIdCounter}`;
    const client: Client = { ws, subscriptions: new Set(), id: clientId };
    clients.set(clientId, client);

    safeSend(ws, {
      type: "connected",
      clientId,
      availableSymbols: marketSimulator.getSymbols(),
      message: "Connected to live market feed",
    });

    ws.on("message", (rawData) => {
      try {
        const msg: WsClientMessage = JSON.parse(rawData.toString());

        if (msg.type === "ping") {
          safeSend(ws, { type: "pong", timestamp: Date.now() });
          return;
        }

        if (!Array.isArray(msg.symbols) || msg.symbols.length === 0) {
          safeSend(ws, { type: "error", message: "symbols array is required" });
          return;
        }

        const validSymbols = marketSimulator.getSymbols();
        const requested = msg.symbols.map((s) => s.toUpperCase());
        const invalid = requested.filter((s) => !validSymbols.includes(s));

        if (invalid.length > 0) {
          safeSend(ws, {
            type: "error",
            message: `Unknown symbols: ${invalid.join(", ")}`,
          });
          return;
        }

        if (msg.type === "subscribe") {
          requested.forEach((s) => client.subscriptions.add(s));
          // Immediately push current snapshot for each subscribed symbol
          const snapshots = requested.map((s) => marketSimulator.getTicker(s)).filter(Boolean);
          safeSend(ws, {
            type: "subscribed",
            symbols: requested,
            snapshots,
          });
        } else if (msg.type === "unsubscribe") {
          requested.forEach((s) => client.subscriptions.delete(s));
          safeSend(ws, { type: "unsubscribed", symbols: requested });
        }
      } catch {
        safeSend(ws, { type: "error", message: "Invalid JSON message" });
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
    });

    ws.on("error", () => {
      clients.delete(clientId);
    });
  });

  return wss;
}
