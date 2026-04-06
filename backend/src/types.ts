export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface TickerTick {
  type: "tick";
  symbol: string;
  price: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface HistoryCandle {
  timestamp: number;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export type HistoryInterval = "1h" | "1d" | "1w";

export interface WsClientMessage {
  type: "subscribe" | "unsubscribe" | "ping";
  symbols?: string[];
}

export interface WsServerMessage {
  type: "tick" | "subscribed" | "unsubscribed" | "error" | "pong";
  [key: string]: unknown;
}
