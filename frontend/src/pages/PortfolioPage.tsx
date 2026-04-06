import { useMemo } from "react";
import styled from "styled-components";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTickerStore } from "../store/tickerStore";
import { formatPrice, formatChangePercent } from "../utils/format";
import Navbar from "../components/layout/Navbar";
import Sparkline from "../components/Sparkline";
import { useNavigate } from "react-router-dom";

// --- Mock portfolio positions ---
const POSITIONS = [
  { symbol: "AAPL",    qty: 10,  avgCost: 175.00 },
  { symbol: "TSLA",    qty: 5,   avgCost: 220.00 },
  { symbol: "BTC-USD", qty: 0.5, avgCost: 58000  },
  { symbol: "ETH-USD", qty: 3,   avgCost: 2800   },
  { symbol: "GOOGL",   qty: 8,   avgCost: 155.00 },
];

const COLORS = ["#c8a84b", "#0ecb81", "#f7931a", "#627eea", "#4285f4"];

const SYMBOL_META: Record<string, { color: string; category: string }> = {
  "AAPL":    { color: "#c8a84b", category: "Stock"  },
  "TSLA":    { color: "#e31937", category: "Stock"  },
  "GOOGL":   { color: "#4285f4", category: "Stock"  },
  "BTC-USD": { color: "#f7931a", category: "Crypto" },
  "ETH-USD": { color: "#627eea", category: "Crypto" },
};

// ---- Sparkline history (last prices stored per symbol) ----
const sparkData: Record<string, number[]> = {};

// --- Styled ---
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;

  @media (max-width: 900px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
`;

const PageSub = styled.p`
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
`;

const Card = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
`;

const CardTitle = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const BigNumber = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 1.6rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: ${(p) =>
    p.$positive ? "var(--green)" : p.$negative ? "var(--red)" : "var(--text-primary)"};
  letter-spacing: -0.5px;
`;

const SubNumber = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 0.78rem;
  font-family: var(--font-mono);
  margin-top: 0.25rem;
  color: ${(p) =>
    p.$positive ? "var(--green)" : p.$negative ? "var(--red)" : "var(--text-muted)"};
`;

const TableWrapper = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
`;

const TableTitle = styled.div`
  padding: 0.9rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 0.6rem 1rem;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--transition);

  &:last-child { border-bottom: none; }
  &:hover { background: var(--bg-hover); }
`;

const Td = styled.td`
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  color: var(--text-primary);
  vertical-align: middle;
  white-space: nowrap;
`;

const SymbolCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const SymbolIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: #0b0c0f;
  flex-shrink: 0;
`;

const SymbolName = styled.div`
  span:first-child {
    display: block;
    font-weight: 700;
    font-family: var(--font-mono);
    font-size: 0.85rem;
  }
  span:last-child {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
`;

const PnlCell = styled.span<{ $positive: boolean }>`
  font-family: var(--font-mono);
  font-weight: 600;
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
`;

const Badge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.45rem;
  border-radius: 3px;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: var(--font-mono);
  background: ${(p) => (p.$positive ? "var(--green-dim)" : "var(--red-dim)")};
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
`;

const DonutCard = styled(Card)`
  padding: 1.25rem;
`;

const DonutTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const LegendList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
`;

const LegendLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
`;

const LegendPct = styled.span`
  font-family: var(--font-mono);
  color: var(--text-primary);
  font-weight: 600;
`;

const ActivityCard = styled(Card)``;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.78rem;

  &:last-child { border-bottom: none; }
`;

const ActivityLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityDot = styled.div<{ $buy: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(p) => (p.$buy ? "var(--green)" : "var(--red)")};
`;

const ActivityText = styled.div`
  color: var(--text-secondary);
  span { color: var(--text-primary); font-weight: 500; }
`;

const ActivityTime = styled.div`
  color: var(--text-muted);
  font-size: 0.72rem;
`;

const MOCK_ACTIVITY = [
  { buy: true,  symbol: "BTC-USD", qty: 0.1,  time: "2h ago"  },
  { buy: false, symbol: "TSLA",    qty: 2,    time: "5h ago"  },
  { buy: true,  symbol: "ETH-USD", qty: 0.5,  time: "1d ago"  },
  { buy: true,  symbol: "AAPL",    qty: 5,    time: "2d ago"  },
  { buy: false, symbol: "GOOGL",   qty: 3,    time: "3d ago"  },
];

// Custom tooltip for donut
function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-sm)",
      padding: "0.5rem 0.75rem",
      fontSize: "0.78rem",
      color: "var(--text-primary)",
    }}>
      <strong>{payload[0].name}</strong>: {payload[0].value.toFixed(1)}%
    </div>
  );
}

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { tickers, setSelectedSymbol } = useTickerStore();

  const positions = useMemo(() => {
    return POSITIONS.map((p) => {
      const t = tickers[p.symbol];
      const currentPrice = t?.price ?? p.avgCost;
      const marketValue = currentPrice * p.qty;
      const costBasis = p.avgCost * p.qty;
      const pnl = marketValue - costBasis;
      const pnlPct = (pnl / costBasis) * 100;
      const isUp = t ? t.changePercent >= 0 : true;

      // Build sparkline
      if (!sparkData[p.symbol]) sparkData[p.symbol] = [p.avgCost];
      if (t && sparkData[p.symbol][sparkData[p.symbol].length - 1] !== currentPrice) {
        sparkData[p.symbol].push(currentPrice);
        if (sparkData[p.symbol].length > 30) sparkData[p.symbol].shift();
      }

      return { ...p, currentPrice, marketValue, costBasis, pnl, pnlPct, isUp, ticker: t };
    });
  }, [tickers]);

  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);
  const totalCost  = positions.reduce((s, p) => s + p.costBasis, 0);
  const totalPnl   = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const dayPnl = positions.reduce((s, p) => {
    const t = p.ticker;
    return s + (t ? (t.price - t.previousPrice) * p.qty : 0);
  }, 0);

  // Allocation for donut
  const allocation = positions.map((p, i) => ({
    name: p.symbol,
    value: totalValue > 0 ? (p.marketValue / totalValue) * 100 : 20,
    color: COLORS[i],
  }));

  function handleRowClick(symbol: string) {
    setSelectedSymbol(symbol);
    navigate("/");
  }

  return (
    <Page>
      <Navbar />
      <Content>
        <PageHeader>
          <PageTitle>Portfolio</PageTitle>
          <PageSub>Simulated holdings — live P&amp;L updates in real time</PageSub>
        </PageHeader>

        {/* Summary cards */}
        <SummaryRow style={{ marginBottom: "1rem" }}>
          <Card>
            <CardTitle>Total Value</CardTitle>
            <BigNumber>${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</BigNumber>
            <SubNumber>Across {positions.length} positions</SubNumber>
          </Card>
          <Card>
            <CardTitle>Total P&amp;L</CardTitle>
            <BigNumber $positive={totalPnl >= 0} $negative={totalPnl < 0}>
              {totalPnl >= 0 ? "+" : ""}${Math.abs(totalPnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </BigNumber>
            <SubNumber $positive={totalPnlPct >= 0} $negative={totalPnlPct < 0}>
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(2)}% all time
            </SubNumber>
          </Card>
          <Card>
            <CardTitle>Today's P&amp;L</CardTitle>
            <BigNumber $positive={dayPnl >= 0} $negative={dayPnl < 0}>
              {dayPnl >= 0 ? "+" : ""}${Math.abs(dayPnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </BigNumber>
            <SubNumber>Based on live tick movement</SubNumber>
          </Card>
          <Card>
            <CardTitle>Cost Basis</CardTitle>
            <BigNumber>${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</BigNumber>
            <SubNumber>Total invested</SubNumber>
          </Card>
        </SummaryRow>

        <Grid>
          <LeftCol>
            {/* Holdings table */}
            <TableWrapper>
              <TableTitle>
                <span>Holdings</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  {positions.length} positions
                </span>
              </TableTitle>
              <Table>
                <thead>
                  <tr>
                    <Th>Asset</Th>
                    <Th>Qty</Th>
                    <Th>Avg Cost</Th>
                    <Th>Current Price</Th>
                    <Th>Market Value</Th>
                    <Th>P&amp;L</Th>
                    <Th>24h</Th>
                    <Th>Trend</Th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => {
                    const meta = SYMBOL_META[p.symbol];
                    const hist = sparkData[p.symbol] || [p.avgCost, p.currentPrice];
                    return (
                      <Tr key={p.symbol} onClick={() => handleRowClick(p.symbol)}>
                        <Td>
                          <SymbolCell>
                            <SymbolIcon $color={meta?.color ?? "var(--accent)"}>
                              {p.symbol.replace("-USD", "").slice(0, 3)}
                            </SymbolIcon>
                            <SymbolName>
                              <span>{p.symbol}</span>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>
                                {meta?.category}
                              </span>
                            </SymbolName>
                          </SymbolCell>
                        </Td>
                        <Td style={{ fontFamily: "var(--font-mono)" }}>{p.qty}</Td>
                        <Td style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          ${p.avgCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </Td>
                        <Td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          ${formatPrice(p.currentPrice, p.symbol)}
                        </Td>
                        <Td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          ${p.marketValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Td>
                        <Td>
                          <PnlCell $positive={p.pnl >= 0}>
                            {p.pnl >= 0 ? "+" : ""}${Math.abs(p.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span style={{ fontSize: "0.7rem", marginLeft: "0.25rem" }}>
                              ({p.pnlPct >= 0 ? "+" : ""}{p.pnlPct.toFixed(2)}%)
                            </span>
                          </PnlCell>
                        </Td>
                        <Td>
                          <Badge $positive={p.isUp}>
                            {p.ticker ? formatChangePercent(p.ticker.changePercent) : "—"}
                          </Badge>
                        </Td>
                        <Td>
                          <Sparkline data={hist} positive={p.pnl >= 0} width={70} height={26} />
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          </LeftCol>

          <RightCol>
            {/* Allocation donut */}
            <DonutCard>
              <DonutTitle>Allocation</DonutTitle>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocation.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <LegendList>
                {allocation.map((a) => (
                  <LegendItem key={a.name}>
                    <LegendLeft>
                      <LegendDot $color={a.color} />
                      <span>{a.name}</span>
                    </LegendLeft>
                    <LegendPct>{a.value.toFixed(1)}%</LegendPct>
                  </LegendItem>
                ))}
              </LegendList>
            </DonutCard>

            {/* Recent activity */}
            <ActivityCard>
              <CardTitle style={{ marginBottom: "0.75rem" }}>Recent Activity</CardTitle>
              {MOCK_ACTIVITY.map((a, idx) => (
                <ActivityItem key={idx}>
                  <ActivityLeft>
                    <ActivityDot $buy={a.buy} />
                    <ActivityText>
                      <span>{a.buy ? "Bought" : "Sold"}</span>{" "}
                      {a.qty} {a.symbol}
                    </ActivityText>
                  </ActivityLeft>
                  <ActivityTime>{a.time}</ActivityTime>
                </ActivityItem>
              ))}
            </ActivityCard>
          </RightCol>
        </Grid>
      </Content>
    </Page>
  );
}
