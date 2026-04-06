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

export interface User {
  email: string;
  name: string;
}

export interface Alert {
  id: string;
  symbol: string;
  threshold: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  timestamp?: number;
}
