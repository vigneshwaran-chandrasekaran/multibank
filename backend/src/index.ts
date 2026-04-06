import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { createWebSocketServer } from "./websocket/handler";
import { marketSimulator } from "./services/marketSimulator";
import tickersRouter from "./routes/tickers";
import historyRouter from "./routes/history";
import authRouter from "./routes/auth";

const app = express();
const PORT = parseInt(process.env.PORT || "4000", 10);

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    symbols: marketSimulator.getSymbols(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/tickers", tickersRouter);
app.use("/api/tickers", historyRouter);

// 404 fallback for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// HTTP Server
const server = http.createServer(app);

// WebSocket
createWebSocketServer(server);

// Start market simulation
marketSimulator.start();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] HTTP + WebSocket running on port ${PORT}`);
  console.log(`[server] WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
  console.log(`[market] Simulator started — ticking every 1s`);
});

// Graceful shutdown
const shutdown = () => {
  console.log("[server] Shutting down gracefully…");
  marketSimulator.stop();
  server.close(() => {
    console.log("[server] HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export { app, server };
