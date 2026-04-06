import request from "supertest";
import { app, server } from "../index";
import { marketSimulator } from "../services/marketSimulator";

afterAll((done) => {
  marketSimulator.stop();
  server.close(done);
});

describe("GET /api/tickers", () => {
  it("returns 200 with array of tickers", async () => {
    const res = await request(app).get("/api/tickers");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("each ticker has required fields", async () => {
    const res = await request(app).get("/api/tickers");
    for (const ticker of res.body.data) {
      expect(ticker).toHaveProperty("symbol");
      expect(ticker).toHaveProperty("price");
      expect(ticker).toHaveProperty("change");
      expect(ticker).toHaveProperty("changePercent");
    }
  });
});

describe("GET /api/tickers/:symbol", () => {
  it("returns 200 for a valid symbol", async () => {
    const res = await request(app).get("/api/tickers/AAPL");
    expect(res.status).toBe(200);
    expect(res.body.data.symbol).toBe("AAPL");
  });

  it("returns 404 for unknown symbol", async () => {
    const res = await request(app).get("/api/tickers/FAKE");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("is case-insensitive", async () => {
    const res = await request(app).get("/api/tickers/aapl");
    expect(res.status).toBe(200);
    expect(res.body.data.symbol).toBe("AAPL");
  });
});

describe("GET /api/tickers/:symbol/history", () => {
  it("returns history with default interval", async () => {
    const res = await request(app).get("/api/tickers/AAPL/history");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("returns 1h interval correctly", async () => {
    const res = await request(app).get("/api/tickers/BTC-USD/history?interval=1h");
    expect(res.status).toBe(200);
    expect(res.body.interval).toBe("1h");
  });

  it("returns 400 for invalid interval", async () => {
    const res = await request(app).get("/api/tickers/AAPL/history?interval=5m");
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown symbol history", async () => {
    const res = await request(app).get("/api/tickers/NONE/history");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/login", () => {
  it("returns token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "trader@example.com", password: "secret" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("trader@example.com");
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "secret" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /health", () => {
  it("returns 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
