import { Router, Request, Response } from "express";
import { marketSimulator } from "../services/marketSimulator";

const router = Router();

// GET /api/tickers — list all tickers with current prices
router.get("/", (_req: Request, res: Response) => {
  const tickers = marketSimulator.getAllTickers();
  res.json({ data: tickers, timestamp: Date.now() });
});

// GET /api/tickers/:symbol — single ticker
router.get("/:symbol", (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const ticker = marketSimulator.getTicker(symbol);
  if (!ticker) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }
  res.json({ data: ticker, timestamp: Date.now() });
});

export default router;
