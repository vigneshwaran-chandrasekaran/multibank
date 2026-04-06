import { useState } from "react";
import styled from "styled-components";
import { useAlertStore } from "../store/alertStore";
import { useTickerStore } from "../store/tickerStore";
import type { Alert } from "../types";
import { formatPrice } from "../utils/format";

const Panel = styled.aside`
  width: 260px;
  min-width: 220px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const PanelHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
`;

const AddAlertForm = styled.form`
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SelectInput = styled.select`
  padding: 0.45rem 0.6rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-family: var(--font-mono);
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const NumberInput = styled.input`
  padding: 0.45rem 0.6rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: var(--font-mono);
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const AddBtn = styled.button`
  padding: 0.45rem 0.75rem;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity var(--transition);

  &:hover {
    opacity: 0.85;
  }
`;

const AlertsList = styled.ul`
  list-style: none;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const AlertItem = styled.li<{ $triggered: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 1rem;
  opacity: ${(p) => (p.$triggered ? 0.45 : 1)};
  transition: opacity var(--transition);

  &:hover {
    background: var(--bg-hover);
  }
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertSymbol = styled.div`
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-primary);
`;

const AlertDetail = styled.div<{ $direction: "above" | "below" }>`
  font-size: 0.72rem;
  color: ${(p) => (p.$direction === "above" ? "var(--green)" : "var(--red)")};
  font-family: var(--font-mono);
  margin-top: 1px;
`;

const AlertStatus = styled.span`
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 1px;
  display: block;
`;

const RemoveBtn = styled.button`
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1;
  padding: 0.2rem;
  border-radius: var(--radius-sm);
  transition: color var(--transition);

  &:hover {
    color: var(--red);
  }
`;

const Empty = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.6;
`;

const SYMBOLS = ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "GOOGL"];

export default function AlertPanel() {
  const { alerts, addAlert, removeAlert } = useAlertStore();
  const tickers = useTickerStore((s) => s.tickers);

  const [symbol, setSymbol] = useState("AAPL");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState("");

  const currentPrice = tickers[symbol]?.price;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(threshold);
    if (!isNaN(val) && val > 0) {
      addAlert({ symbol, direction, threshold: val });
      setThreshold("");
    }
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  const renderAlert = (alert: Alert) => (
    <AlertItem key={alert.id} $triggered={alert.triggered}>
      <AlertInfo>
        <AlertSymbol>{alert.symbol}</AlertSymbol>
        <AlertDetail $direction={alert.direction}>
          {alert.direction === "above" ? "↑ Above" : "↓ Below"} $
          {alert.threshold.toLocaleString()}
        </AlertDetail>
        {alert.triggered && <AlertStatus>✓ Triggered</AlertStatus>}
      </AlertInfo>
      <RemoveBtn
        onClick={() => removeAlert(alert.id)}
        title="Remove alert"
        aria-label={`Remove alert for ${alert.symbol}`}
      >
        ×
      </RemoveBtn>
    </AlertItem>
  );

  return (
    <Panel>
      <PanelHeader>Price Alerts</PanelHeader>

      <AddAlertForm onSubmit={handleAdd}>
        <SelectInput
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          aria-label="Select symbol"
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </SelectInput>

        {currentPrice !== undefined && (
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Current: ${formatPrice(currentPrice, symbol)}
          </div>
        )}

        <FormRow>
          <SelectInput
            value={direction}
            onChange={(e) => setDirection(e.target.value as "above" | "below")}
            style={{ flex: "0 0 90px" }}
            aria-label="Direction"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </SelectInput>
          <NumberInput
            type="number"
            placeholder="Price"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            step="any"
            min="0"
            aria-label="Threshold price"
          />
          <AddBtn type="submit" aria-label="Add alert">
            Add
          </AddBtn>
        </FormRow>
      </AddAlertForm>

      <AlertsList>
        {activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
          <Empty>
            No alerts set.
            <br />
            Choose a symbol and price above to get notified.
          </Empty>
        ) : (
          <>
            {activeAlerts.map(renderAlert)}
            {triggeredAlerts.length > 0 && (
              <>
                <li style={{ padding: "0.4rem 1rem", fontSize: "0.7rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  Triggered
                </li>
                {triggeredAlerts.map(renderAlert)}
              </>
            )}
          </>
        )}
      </AlertsList>
    </Panel>
  );
}
