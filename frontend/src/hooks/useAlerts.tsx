import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAlertStore } from "../store/alertStore";
import { useTickerStore } from "../store/tickerStore";

export function useAlerts() {
  const { alerts, markTriggered } = useAlertStore();
  const tickers = useTickerStore((s) => s.tickers);

  useEffect(() => {
    for (const alert of alerts) {
      if (alert.triggered) continue;
      const ticker = tickers[alert.symbol];
      if (!ticker) continue;

      const triggered =
        alert.direction === "above"
          ? ticker.price >= alert.threshold
          : ticker.price <= alert.threshold;

      if (triggered) {
        markTriggered(alert.id);
        const dir = alert.direction === "above" ? "↑ above" : "↓ below";
        toast.custom(
          (t) => (
            <div
              style={{
                background: alert.direction === "above" ? "#16a34a" : "#dc2626",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 14,
                opacity: t.visible ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            >
              <strong>{alert.symbol}</strong> {dir} ${alert.threshold.toLocaleString()} — current: $
              {ticker.price.toLocaleString()}
            </div>
          ),
          { duration: 6000 }
        );
      }
    }
  }, [tickers, alerts, markTriggered]);
}
