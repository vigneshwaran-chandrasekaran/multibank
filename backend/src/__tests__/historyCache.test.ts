import { historyCache } from "../services/historyCache";

describe("HistoryCache", () => {
  it("returns candles for AAPL with default 1d interval", () => {
    const candles = historyCache.get("AAPL", "1d");
    expect(candles).not.toBeNull();
    expect(Array.isArray(candles)).toBe(true);
    expect(candles!.length).toBeGreaterThan(0);
  });

  it("returns candles for BTC-USD with 1h interval", () => {
    const candles = historyCache.get("BTC-USD", "1h");
    expect(candles).not.toBeNull();
    expect(candles!.length).toBeGreaterThan(0);
  });

  it("each candle has required OHLCV fields", () => {
    const candles = historyCache.get("GOOGL", "1w")!;
    for (const c of candles) {
      expect(typeof c.timestamp).toBe("number");
      expect(typeof c.open).toBe("number");
      expect(typeof c.high).toBe("number");
      expect(typeof c.low).toBe("number");
      expect(typeof c.close).toBe("number");
      expect(typeof c.volume).toBe("number");
      expect(c.high).toBeGreaterThanOrEqual(c.open);
      expect(c.high).toBeGreaterThanOrEqual(c.close);
      expect(c.low).toBeLessThanOrEqual(c.open);
      expect(c.low).toBeLessThanOrEqual(c.close);
    }
  });

  it("returns null for unknown symbol", () => {
    const candles = historyCache.get("NOTEXIST", "1d");
    expect(candles).toBeNull();
  });

  it("validates interval strings correctly", () => {
    expect(historyCache.isValidInterval("1h")).toBe(true);
    expect(historyCache.isValidInterval("1d")).toBe(true);
    expect(historyCache.isValidInterval("1w")).toBe(true);
    expect(historyCache.isValidInterval("5m")).toBe(false);
    expect(historyCache.isValidInterval("")).toBe(false);
    expect(historyCache.isValidInterval("1M")).toBe(false);
  });

  it("candle timestamps are in ascending order", () => {
    const candles = historyCache.get("TSLA", "1d")!;
    for (let i = 1; i < candles.length; i++) {
      expect(candles[i].timestamp).toBeGreaterThan(candles[i - 1].timestamp);
    }
  });
});
