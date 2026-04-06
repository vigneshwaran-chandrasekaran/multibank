import { EventEmitter } from "events";
import { Ticker, TickerTick } from "../types";

const TICKER_METADATA: Record<string, { name: string; basePrice: number }> = {
  AAPL: { name: "Apple Inc.", basePrice: 182.5 },
  TSLA: { name: "Tesla Inc.", basePrice: 245.0 },
  "BTC-USD": { name: "Bitcoin USD", basePrice: 67000 },
  "ETH-USD": { name: "Ethereum USD", basePrice: 3500 },
  GOOGL: { name: "Alphabet Inc.", basePrice: 175.0 },
};

const SYMBOLS = Object.keys(TICKER_METADATA);

function randomWalk(current: number, volatility = 0.002): number {
  // Gaussian-like step using Box-Muller approximation
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const change = current * volatility * z;
  return Math.max(0.01, current + change);
}

class MarketSimulator extends EventEmitter {
  private tickers: Map<string, Ticker> = new Map();
  private intervalRef: NodeJS.Timeout | null = null;
  private tickIntervalMs: number;

  constructor(tickIntervalMs = 1000) {
    super();
    this.tickIntervalMs = tickIntervalMs;
    this.initTickers();
  }

  private initTickers(): void {
    for (const symbol of SYMBOLS) {
      const meta = TICKER_METADATA[symbol];
      const price = meta.basePrice;
      this.tickers.set(symbol, {
        symbol,
        name: meta.name,
        price,
        previousPrice: price,
        change: 0,
        changePercent: 0,
        high: price,
        low: price,
        volume: Math.floor(Math.random() * 1_000_000) + 500_000,
        timestamp: Date.now(),
      });
    }
  }

  start(): void {
    if (this.intervalRef) return;
    this.intervalRef = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  stop(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private tick(): void {
    for (const symbol of SYMBOLS) {
      const current = this.tickers.get(symbol)!;
      const volatility = symbol.includes("BTC") || symbol.includes("ETH")
        ? 0.003
        : 0.0015;
      const newPrice = parseFloat(randomWalk(current.price, volatility).toFixed(
        symbol.includes("BTC") ? 2 : 4
      ));
      const change = parseFloat((newPrice - current.price).toFixed(4));
      const changePercent = parseFloat(
        ((change / current.price) * 100).toFixed(4)
      );
      const newHigh = Math.max(current.high, newPrice);
      const newLow = Math.min(current.low, newPrice);
      const newVolume = current.volume + Math.floor(Math.random() * 1000);

      const updated: Ticker = {
        ...current,
        previousPrice: current.price,
        price: newPrice,
        change,
        changePercent,
        high: newHigh,
        low: newLow,
        volume: newVolume,
        timestamp: Date.now(),
      };

      this.tickers.set(symbol, updated);

      const tick: TickerTick = {
        type: "tick",
        symbol,
        price: newPrice,
        previousPrice: current.price,
        change,
        changePercent,
        high: newHigh,
        low: newLow,
        volume: newVolume,
        timestamp: updated.timestamp,
      };

      this.emit("tick", tick);
      this.emit(`tick:${symbol}`, tick);
    }
  }

  getTicker(symbol: string): Ticker | undefined {
    return this.tickers.get(symbol);
  }

  getAllTickers(): Ticker[] {
    return Array.from(this.tickers.values());
  }

  getSymbols(): string[] {
    return SYMBOLS;
  }
}

// Singleton
export const marketSimulator = new MarketSimulator();
export { MarketSimulator, SYMBOLS, TICKER_METADATA };
