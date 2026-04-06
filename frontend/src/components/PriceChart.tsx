import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import styled from "styled-components";
import { format } from "date-fns";
import { tickersApi } from "../api/endpoints";
import { useTickerStore } from "../store/tickerStore";
import type { HistoryCandle, HistoryInterval } from "../types";
import { formatPrice, formatChange, formatChangePercent } from "../utils/format";

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  gap: 1rem;
  min-height: 0;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TickerInfo = styled.div``;

const Symbol = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const TickerFullName = styled.p`
  color: var(--text-muted);
  font-size: 0.8rem;
`;

const PriceBlock = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const LivePrice = styled.span<{ $flash: "up" | "down" | "none" }>`
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: ${(p) =>
    p.$flash === "up"
      ? "var(--green)"
      : p.$flash === "down"
      ? "var(--red)"
      : "var(--text-primary)"};
  transition: color 0.4s ease;
`;

const ChangeChip = styled.span<{ $positive: boolean }>`
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  background: ${(p) => (p.$positive ? "var(--green-dim)" : "var(--red-dim)")};
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
`;

const HighLow = styled.div`
  display: flex;
  gap: 1.25rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
`;

const HighLowItem = styled.span<{ $type: "high" | "low" }>`
  strong {
    color: ${(p) => (p.$type === "high" ? "var(--green)" : "var(--red)")};
  }
`;

const IntervalBar = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const IntervalBtn = styled.button<{ $active: boolean }>`
  padding: 0.3rem 0.7rem;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: var(--font-mono);
  background: ${(p) => (p.$active ? "var(--accent)" : "var(--bg-card)")};
  color: ${(p) => (p.$active ? "#fff" : "var(--text-secondary)")};
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--border)")};
  transition: all var(--transition);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const ChartArea = styled.div`
  flex: 1;
  min-height: 280px;
`;

const ErrorMsg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  font-size: 0.9rem;
`;

interface ChartPoint {
  timestamp: number;
  price: number;
  label: string;
}

const INTERVAL_LABELS: Record<HistoryInterval, string> = {
  "1h": "1H",
  "1d": "1D",
  "1w": "1W",
};

const TIME_FORMAT: Record<HistoryInterval, string> = {
  "1h": "HH:mm",
  "1d": "HH:mm",
  "1w": "MMM d",
};

// Build chart data from history candles + append live tick
function buildChartData(
  candles: HistoryCandle[],
  interval: HistoryInterval
): ChartPoint[] {
  return candles.map((c) => ({
    timestamp: c.timestamp,
    price: c.close,
    label: format(new Date(c.timestamp), TIME_FORMAT[interval]),
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "var(--text-primary)", fontWeight: 700 }}>
        ${Number(payload[0].value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export default function PriceChart() {
  const { tickers, selectedSymbol } = useTickerStore();
  const ticker = tickers[selectedSymbol];
  const [interval, setInterval] = useState<HistoryInterval>("1d");
  const [livePoints, setLivePoints] = useState<ChartPoint[]>([]);
  const [flash, setFlash] = useState<"up" | "down" | "none">("none");
  const prevPrice = useRef<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch historical candles — cached for 5 minutes
  const { data: candles, isLoading, isError } = useQuery({
    queryKey: ["history", selectedSymbol, interval],
    queryFn: () => tickersApi.getHistory(selectedSymbol, interval),
    staleTime: 5 * 60 * 1000,
    enabled: !!selectedSymbol,
  });

  // Reset live points when symbol or interval changes
  useEffect(() => {
    setLivePoints([]);
    prevPrice.current = null;
  }, [selectedSymbol, interval]);

  // Append live tick to chart
  useEffect(() => {
    if (!ticker) return;
    const prev = prevPrice.current;

    if (prev !== null) {
      if (ticker.price > prev) {
        setFlash("up");
      } else if (ticker.price < prev) {
        setFlash("down");
      }
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash("none"), 500);
    }

    prevPrice.current = ticker.price;

    const point: ChartPoint = {
      timestamp: ticker.timestamp,
      price: ticker.price,
      label: format(new Date(ticker.timestamp), TIME_FORMAT[interval]),
    };

    setLivePoints((prev) => {
      const updated = [...prev, point];
      // Keep last 60 live points to avoid unbounded growth
      return updated.slice(-60);
    });

    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [ticker?.price, ticker?.timestamp, interval]); // eslint-disable-line

  const historicalPoints = candles ? buildChartData(candles, interval) : [];
  const chartData = [...historicalPoints, ...livePoints];

  const firstPrice = chartData[0]?.price;
  const isPositive = ticker
    ? ticker.changePercent >= 0
    : true;
  const lineColor = isPositive ? "var(--green)" : "var(--red)";

  return (
    <Wrapper>
      <Header>
        <div>
          <TickerInfo>
            <Symbol>{selectedSymbol}</Symbol>
            <TickerFullName>{ticker?.name ?? ""}</TickerFullName>
          </TickerInfo>

          {ticker && (
            <PriceBlock>
              <LivePrice $flash={flash}>
                ${formatPrice(ticker.price, selectedSymbol)}
              </LivePrice>
              <ChangeChip $positive={isPositive}>
                {formatChange(ticker.change)}&nbsp;
                ({formatChangePercent(ticker.changePercent)})
              </ChangeChip>
            </PriceBlock>
          )}

          {ticker && (
            <HighLow>
              <HighLowItem $type="high">
                H: <strong>${formatPrice(ticker.high, selectedSymbol)}</strong>
              </HighLowItem>
              <HighLowItem $type="low">
                L: <strong>${formatPrice(ticker.low, selectedSymbol)}</strong>
              </HighLowItem>
            </HighLow>
          )}
        </div>

        <IntervalBar>
          {(Object.keys(INTERVAL_LABELS) as HistoryInterval[]).map((iv) => (
            <IntervalBtn
              key={iv}
              $active={interval === iv}
              onClick={() => setInterval(iv)}
            >
              {INTERVAL_LABELS[iv]}
            </IntervalBtn>
          ))}
        </IntervalBar>
      </Header>

      <ChartArea>
        {isError ? (
          <ErrorMsg>Failed to load chart data. Please try again.</ErrorMsg>
        ) : isLoading ? (
          <ErrorMsg>Loading chart…</ErrorMsg>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(v: number) =>
                  `$${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              {firstPrice && (
                <ReferenceLine
                  y={firstPrice}
                  stroke="var(--text-muted)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
              )}
              <Line
                type="monotone"
                dataKey="price"
                dot={false}
                stroke={lineColor}
                strokeWidth={2}
                activeDot={{ r: 4, fill: lineColor }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartArea>
    </Wrapper>
  );
}
