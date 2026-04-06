import { Router, Request, Response } from "express";
import { historyCache } from "../services/historyCache";

const router = Router();

// GET /api/tickers/:symbol/history?interval=1h|1d|1w
router.get("/:symbol/history", (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  const interval = (req.query.interval as string) || "1d";

  if (!historyCache.isValidInterval(interval)) {
    res.status(400).json({
      error: "Invalid interval. Allowed values: 1h, 1d, 1w",
    });
    return;
  }

  const candles = historyCache.get(symbol, interval);
  if (!candles) {
    res.status(404).json({ error: `No history data for symbol '${symbol}'` });
    return;
  }

  res.json({ symbol, interval, data: candles, count: candles.length });
});

export default router;
