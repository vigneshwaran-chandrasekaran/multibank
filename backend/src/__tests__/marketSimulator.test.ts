import { MarketSimulator, TICKER_METADATA } from "../services/marketSimulator";

describe("MarketSimulator", () => {
  let sim: MarketSimulator;

  beforeEach(() => {
    sim = new MarketSimulator(50); // fast tick for tests
  });

  afterEach(() => {
    sim.stop();
  });

  it("initialises all expected symbols", () => {
    const symbols = sim.getSymbols();
    expect(symbols).toContain("AAPL");
    expect(symbols).toContain("TSLA");
    expect(symbols).toContain("BTC-USD");
    expect(symbols).toContain("ETH-USD");
    expect(symbols).toContain("GOOGL");
    expect(symbols).toHaveLength(5);
  });

  it("returns all tickers with correct base structure", () => {
    const tickers = sim.getAllTickers();
    expect(tickers.length).toBe(5);

    for (const ticker of tickers) {
      expect(ticker).toHaveProperty("symbol");
      expect(ticker).toHaveProperty("name");
      expect(ticker).toHaveProperty("price");
      expect(ticker).toHaveProperty("change");
      expect(ticker).toHaveProperty("changePercent");
      expect(ticker).toHaveProperty("high");
      expect(ticker).toHaveProperty("low");
      expect(ticker).toHaveProperty("volume");
      expect(ticker).toHaveProperty("timestamp");
      expect(ticker.price).toBeGreaterThan(0);
      expect(typeof ticker.price).toBe("number");
    }
  });

  it("returns correct ticker for individual symbol lookup", () => {
    const ticker = sim.getTicker("AAPL");
    expect(ticker).toBeDefined();
    expect(ticker!.symbol).toBe("AAPL");
    expect(ticker!.name).toBe(TICKER_METADATA["AAPL"].name);
  });

  it("returns undefined for unknown symbol", () => {
    expect(sim.getTicker("UNKNOWN")).toBeUndefined();
  });

  it("emits tick events on start", (done) => {
    sim.once("tick", (tick) => {
      expect(tick).toHaveProperty("type", "tick");
      expect(tick).toHaveProperty("symbol");
      expect(tick).toHaveProperty("price");
      expect(typeof tick.price).toBe("number");
      expect(tick.price).toBeGreaterThan(0);
      sim.stop();
      done();
    });
    sim.start();
  });

  it("price stays positive after many ticks", (done) => {
    let tickCount = 0;
    sim.on("tick", (tick) => {
      expect(tick.price).toBeGreaterThan(0);
      tickCount++;
      if (tickCount >= 25) {
        sim.stop();
        done();
      }
    });
    sim.start();
  });

  it("does not emit after stop()", (done) => {
    let hitAfterStop = false;

    sim.start();
    setTimeout(() => {
      sim.stop();
      sim.on("tick", () => {
        hitAfterStop = true;
      });
      setTimeout(() => {
        expect(hitAfterStop).toBe(false);
        done();
      }, 200);
    }, 150);
  });

  it("tick event includes high and low that bound the price", (done) => {
    sim.once("tick", (tick) => {
      expect(tick.high).toBeGreaterThanOrEqual(tick.price);
      expect(tick.low).toBeLessThanOrEqual(tick.price);
      sim.stop();
      done();
    });
    sim.start();
  });
});
