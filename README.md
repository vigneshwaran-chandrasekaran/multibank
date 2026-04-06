# TradeDash — Real-Time Trading Dashboard

A full-stack real-time cryptocurrency and stock trading dashboard built with React, TypeScript, Node.js, WebSockets, and Docker.

---

## Overview

TradeDash streams live simulated price ticks for **AAPL, TSLA, BTC-USD, ETH-USD, and GOOGL** via WebSocket, renders interactive charts with React Query-cached historical data, and lets you set price-threshold alerts with toast notifications.

| Feature | Implementation |
|---------|---------------|
| Live prices | WebSocket → Zustand store, flashing price cells |
| Real-time chart | Recharts `LineChart`, appending live ticks |
| Historical candles | REST API + React Query (5-min client cache) |
| Interval selector | 1H / 1D / 1W |
| Auth | Mocked JWT (any email + password works) |
| Price alerts | Zustand persist + `react-hot-toast` |
| Responsive layout | CSS-in-JS (styled-components), mobile-aware sidebar |

---

## Tech Stack

**Frontend:** React 19 · TypeScript · Vite · styled-components · Recharts · Zustand · React Query · React Router  
**Backend:** Node.js · Express · TypeScript · `ws` (WebSocket)  
**Infra:** Docker · docker-compose  
**Deployment:** Vercel (frontend) · Railway (backend)  
**Tests:** Jest + Supertest (backend) · Vitest + Testing Library (frontend)

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 9+
- Docker & docker-compose (optional, for containerised run)

### 1. Run locally (development)

```bash
# Clone
git clone <repo-url>
cd multibank

# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # starts on http://localhost:4000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — log in with **any** email and password.

### 2. Run with Docker

```bash
# From the repo root
docker compose up --build
```

- Frontend → [http://localhost:3000](http://localhost:3000)
- Backend API → [http://localhost:4000](http://localhost:4000)
- WebSocket → `ws://localhost:4000/ws`

---

## Running Tests

```bash
# Backend (Jest)
cd backend && npm test

# Backend with coverage
cd backend && npm run test:coverage

# Frontend (Vitest)
cd frontend && npm test
```

Backend has **21 tests** across two suites covering the market simulator, all REST routes, and auth.

---

## Project Structure

```
multibank/
├── backend/
│   └── src/
│       ├── services/         marketSimulator.ts, historyCache.ts
│       ├── routes/           tickers.ts, history.ts, auth.ts
│       ├── websocket/        handler.ts
│       └── __tests__/        marketSimulator.test.ts, routes.test.ts
├── frontend/
│   └── src/
│       ├── api/              client.ts, endpoints.ts
│       ├── components/       TickerSidebar, PriceChart, AlertPanel, layout/Navbar
│       ├── hooks/            useWebSocket.ts, useAlerts.tsx
│       ├── pages/            LoginPage, DashboardPage
│       ├── store/            authStore, tickerStore, alertStore (Zustand)
│       └── types/            index.ts
├── docker-compose.yml
└── README.md
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Get JWT token (any valid email+password) |
| `POST` | `/api/auth/logout` | Stateless logout |
| `GET`  | `/api/tickers` | All tickers with current prices |
| `GET`  | `/api/tickers/:symbol` | Single ticker |
| `GET`  | `/api/tickers/:symbol/history?interval=1h\|1d\|1w` | Historical OHLC candles |
| `GET`  | `/health` | Server health check |

**WebSocket** (`ws://<host>/ws`):
```jsonc
// Client → Server
{ "type": "subscribe", "symbols": ["AAPL", "BTC-USD"] }

// Server → Client (on every tick)
{ "type": "tick", "symbol": "AAPL", "price": 183.42, "change": 0.23, "changePercent": 0.13, ... }
```

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. New project on [railway.app](https://railway.app), connect the repo
3. Set root directory to `/backend`
4. Add environment variable `JWT_SECRET=<strong-secret>` and `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
5. Railway auto-detects the `Dockerfile` and deploys

### Frontend → Vercel

1. New project on [vercel.com](https://vercel.com), connect the repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL=https://your-backend.railway.app`
   - `VITE_WS_URL=wss://your-backend.railway.app`
4. Deploy — Vercel auto-runs `npm run build`, serves `dist/`, and `vercel.json` handles SPA routing

---

## Assumptions & Trade-offs

- **Mocked auth**: Any email + password combination succeeds. In production this would verify against a user store with hashed passwords (bcrypt). JWT signing key should be rotated and kept in secrets management.
- **In-memory market state**: All price data lives in a `Map` inside the Node.js process. A Redis pub/sub or message broker like Kafka would be needed for a multi-instance production setup.
- **Historical data is pre-generated**: Candles are produced at startup via a seeded random walk. A real implementation would pull from a market data provider (Polygon.io, Alpha Vantage) or a time-series DB.
- **No Kubernetes manifests**: Out of scope given the containerised Docker deployment covers the requirement. Kubernetes YAML would be the natural next step for orchestrated production.
- **WebSocket reconnection**: The frontend attempts up to 10 reconnects with a 3-second delay. A production client would use exponential back-off with jitter.
- **Bundle size**: The Recharts + recharts transitive deps produce a ~740 kB bundle. Code-splitting (dynamic `import()` for the chart) would help here for first-render performance.

---

## Bonus Features Implemented

- [x] Mocked user authentication with JWT
- [x] Client-side caching of historical data (React Query, 5-min stale time)
- [x] Price threshold alerts with toast notifications
- [x] WebSocket auto-reconnect (up to 10 attempts)
- [x] Responsive layout (sidebar converts to top bar on mobile)
- [x] Price flash animation (green/red on tick direction change)

multibank
