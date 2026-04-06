import { create } from "zustand";
import type { Ticker, TickerTick } from "../types";

interface TickerState {
  tickers: Record<string, Ticker>;
  selectedSymbol: string;
  isConnected: boolean;
  setTickers: (tickers: Ticker[]) => void;
  applyTick: (tick: TickerTick) => void;
  setSelectedSymbol: (symbol: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useTickerStore = create<TickerState>((set) => ({
  tickers: {},
  selectedSymbol: "AAPL",
  isConnected: false,

  setTickers: (tickers) => {
    const map: Record<string, Ticker> = {};
    for (const t of tickers) {
      map[t.symbol] = t;
    }
    set({ tickers: map });
  },

  applyTick: (tick) =>
    set((state) => {
      const existing = state.tickers[tick.symbol];
      if (!existing) return state;
      return {
        tickers: {
          ...state.tickers,
          [tick.symbol]: {
            ...existing,
            price: tick.price,
            previousPrice: tick.previousPrice,
            change: tick.change,
            changePercent: tick.changePercent,
            high: tick.high,
            low: tick.low,
            volume: tick.volume,
            timestamp: tick.timestamp,
          },
        },
      };
    }),

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setConnected: (connected) => set({ isConnected: connected }),
}));
