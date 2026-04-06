import { HistoryCandle, HistoryInterval } from "../types";
import { TICKER_METADATA } from "./marketSimulator";

const CANDLES_PER_INTERVAL: Record<HistoryInterval, number> = {
  "1h": 60,  // 60 one-minute candles
  "1d": 48,  // 48 thirty-minute candles
  "1w": 56,  // 56 three-hour candles
};

const INTERVAL_MS: Record<HistoryInterval, number> = {
  "1h": 60 * 1000,         // 1 minute
  "1d": 30 * 60 * 1000,    // 30 minutes
  "1w": 3 * 60 * 60 * 1000, // 3 hours
};

function generateCandleHistory(
  basePrice: number,
  count: number,
  intervalMs: number,
  volatility = 0.015
): HistoryCandle[] {
  const candles: HistoryCandle[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const open = price;

    // Generate 4 price points within the candle
    const intra = [open];
    for (let j = 0; j < 3; j++) {
      const prev = intra[intra.length - 1];
      const move = prev * volatility * (Math.random() * 2 - 1);
      intra.push(Math.max(0.01, prev + move));
    }

    const close = intra[intra.length - 1];
    const high = Math.max(...intra);
    const low = Math.min(...intra);
    const volume = Math.floor(Math.random() * 500_000) + 100_000;

    candles.push({ timestamp, open: parseFloat(open.toFixed(4)), high: parseFloat(high.toFixed(4)), low: parseFloat(low.toFixed(4)), close: parseFloat(close.toFixed(4)), volume });
    price = close;
  }

  return candles;
}

class HistoryCache {
  private cache: Map<string, Map<HistoryInterval, HistoryCandle[]>> = new Map();

  constructor() {
    this.pregenerate();
  }

  private pregenerate(): void {
    for (const [symbol, meta] of Object.entries(TICKER_METADATA)) {
      const symbolMap = new Map<HistoryInterval, HistoryCandle[]>();
      const intervals: HistoryInterval[] = ["1h", "1d", "1w"];

      for (const interval of intervals) {
        const count = CANDLES_PER_INTERVAL[interval];
        const ms = INTERVAL_MS[interval];
        const volatility = symbol.includes("BTC") || symbol.includes("ETH")
          ? 0.025
          : 0.012;
        const candles = generateCandleHistory(meta.basePrice, count, ms, volatility);
        symbolMap.set(interval, candles);
      }

      this.cache.set(symbol, symbolMap);
    }
  }

  get(symbol: string, interval: HistoryInterval): HistoryCandle[] | null {
    const symbolMap = this.cache.get(symbol);
    if (!symbolMap) return null;
    return symbolMap.get(interval) ?? null;
  }

  isValidInterval(interval: string): interval is HistoryInterval {
    return ["1h", "1d", "1w"].includes(interval);
  }
}

export const historyCache = new HistoryCache();
