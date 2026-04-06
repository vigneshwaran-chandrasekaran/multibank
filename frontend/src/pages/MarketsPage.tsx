import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import { useTickerStore } from "../store/tickerStore";
import { formatPrice, formatChangePercent, formatVolume } from "../utils/format";
import type { Ticker } from "../types";
import Sparkline from "../components/Sparkline";
import Navbar from "../components/layout/Navbar";

// --- Types ---
type SortKey = "symbol" | "price" | "changePercent" | "high" | "low" | "volume";
type SortDir = "asc" | "desc";

// --- Styled Components ---
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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div``;

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

const SearchInput = styled.input`
  padding: 0.5rem 0.85rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.82rem;
  width: 220px;
  transition: border-color var(--transition);

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 0.4rem;
`;

const StatValue = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  font-size: 1.15rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: ${(p) =>
    p.$positive ? "var(--green)" : p.$negative ? "var(--red)" : "var(--text-primary)"};
`;

const TableWrapper = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ $sortable?: boolean; $active?: boolean }>`
  padding: 0.65rem 1rem;
  text-align: left;
  font-size: 0.68rem;
  font-weight: 600;
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-muted)")};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
  cursor: ${(p) => (p.$sortable ? "pointer" : "default")};
  white-space: nowrap;
  user-select: none;
  transition: color var(--transition);

  &:hover {
    color: ${(p) => (p.$sortable ? "var(--text-primary)" : "var(--text-muted)")};
  }
`;

const flashGreen = keyframes`
  0%   { background: var(--green-dim); }
  100% { background: transparent; }
`;

const flashRed = keyframes`
  0%   { background: var(--red-dim); }
  100% { background: transparent; }
`;

const Tr = styled.tr<{ $dir?: "up" | "down" | "flat" }>`
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--transition);

  ${(p) =>
    p.$dir === "up" &&
    css`animation: ${flashGreen} 0.7s ease;`}
  ${(p) =>
    p.$dir === "down" &&
    css`animation: ${flashRed} 0.7s ease;`}

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--bg-hover);
  }
`;

const Td = styled.td`
  padding: 0.8rem 1rem;
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
  font-size: 0.65rem;
  font-weight: 800;
  color: #0b0c0f;
  flex-shrink: 0;
  letter-spacing: -0.5px;
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

const PriceCell = styled.div`
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.88rem;
`;

const ChangeCell = styled.div<{ $positive: boolean }>`
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 500;
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Badge = styled.span<{ $positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.18rem 0.45rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-mono);
  background: ${(p) => (p.$positive ? "var(--green-dim)" : "var(--red-dim)")};
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
`;

const RangeBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 100px;
`;

const RangeTrack = styled.div`
  position: relative;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  width: 100%;
`;

const RangeFill = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  top: 0;
  left: ${(p) => p.$left}%;
  width: ${(p) => p.$width}%;
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
`;

const RangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button<{ $active: boolean }>`
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
  border: 1px solid ${(p) => (p.$active ? "var(--accent)" : "var(--border)")};
  background: ${(p) => (p.$active ? "var(--accent-dim)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--accent)" : "var(--text-secondary)")};
  transition: all var(--transition);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
`;

// --- Symbol metadata ---
const SYMBOL_META: Record<string, { icon: string; color: string; category: string; marketCap: string }> = {
  "AAPL":    { icon: "AAPL", color: "#c8a84b", category: "Stocks",  marketCap: "$2.87T" },
  "TSLA":    { icon: "TSLA", color: "#e31937", category: "Stocks",  marketCap: "$582B"  },
  "GOOGL":   { icon: "GOOG", color: "#4285f4", category: "Stocks",  marketCap: "$1.97T" },
  "BTC-USD": { icon: "BTC",  color: "#f7931a", category: "Crypto",  marketCap: "$1.38T" },
  "ETH-USD": { icon: "ETH",  color: "#627eea", category: "Crypto",  marketCap: "$324B"  },
};

// --- Sparkline history tracker ---
const priceHistory: Record<string, number[]> = {};
const MAX_HISTORY = 30;

// --- Component ---
export default function MarketsPage() {
  const navigate = useNavigate();
  const { tickers, setSelectedSymbol } = useTickerStore();
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Stocks" | "Crypto">("All");
  const prevPrices = useRef<Record<string, number>>({});

  // Track sparkline history
  useEffect(() => {
    const list = Object.values(tickers);
    for (const t of list) {
      if (!priceHistory[t.symbol]) priceHistory[t.symbol] = [];
      const hist = priceHistory[t.symbol];
      if (hist[hist.length - 1] !== t.price) {
        hist.push(t.price);
        if (hist.length > MAX_HISTORY) hist.shift();
      }
      prevPrices.current[t.symbol] = t.price;
    }
  }, [tickers]);

  const tickerList = Object.values(tickers);

  // Market stats
  const gainers = tickerList.filter((t) => t.changePercent > 0).length;
  const losers  = tickerList.filter((t) => t.changePercent < 0).length;
  const totalVol = tickerList.reduce((s, t) => s + t.volume, 0);
  const avgChange = tickerList.length
    ? tickerList.reduce((s, t) => s + t.changePercent, 0) / tickerList.length
    : 0;

  // Filter + search + sort
  const filtered = tickerList
    .filter((t) => {
      const meta = SYMBOL_META[t.symbol];
      if (filter !== "All" && meta?.category !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "symbol") diff = a.symbol.localeCompare(b.symbol);
      else if (sortKey === "price") diff = a.price - b.price;
      else if (sortKey === "changePercent") diff = a.changePercent - b.changePercent;
      else if (sortKey === "high") diff = a.high - b.high;
      else if (sortKey === "low") diff = a.low - b.low;
      else if (sortKey === "volume") diff = a.volume - b.volume;
      return sortDir === "asc" ? diff : -diff;
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  function handleRowClick(t: Ticker) {
    setSelectedSymbol(t.symbol);
    navigate("/");
  }

  return (
    <Page>
      <Navbar />
      <Content>
        <PageHeader>
          <TitleBlock>
            <PageTitle>Markets</PageTitle>
            <PageSub>Live prices — updates every second</PageSub>
          </TitleBlock>
          <SearchInput
            placeholder="Search symbol or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </PageHeader>

        {/* Stats */}
        <StatsRow>
          <StatCard>
            <StatLabel>Tracked Assets</StatLabel>
            <StatValue>{tickerList.length}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Gainers / Losers</StatLabel>
            <StatValue>
              <span style={{ color: "var(--green)" }}>{gainers}↑</span>
              {" / "}
              <span style={{ color: "var(--red)" }}>{losers}↓</span>
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Avg Change</StatLabel>
            <StatValue $positive={avgChange > 0} $negative={avgChange < 0}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Total Volume</StatLabel>
            <StatValue>{formatVolume(totalVol)}</StatValue>
          </StatCard>
        </StatsRow>

        {/* Filters */}
        <FilterRow>
          {(["All", "Stocks", "Crypto"] as const).map((f) => (
            <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </FilterBtn>
          ))}
        </FilterRow>

        {/* Table */}
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th $sortable $active={sortKey === "symbol"} onClick={() => toggleSort("symbol")}>
                  Asset{sortIcon("symbol")}
                </Th>
                <Th $sortable $active={sortKey === "price"} onClick={() => toggleSort("price")}>
                  Price{sortIcon("price")}
                </Th>
                <Th $sortable $active={sortKey === "changePercent"} onClick={() => toggleSort("changePercent")}>
                  24h Change{sortIcon("changePercent")}
                </Th>
                <Th>24h Range</Th>
                <Th $sortable $active={sortKey === "volume"} onClick={() => toggleSort("volume")}>
                  Volume{sortIcon("volume")}
                </Th>
                <Th>Market Cap</Th>
                <Th>7D Trend</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState>No assets match your search.</EmptyState>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isUp = t.changePercent >= 0;
                  const dir = t.change > 0 ? "up" : t.change < 0 ? "down" : "flat";
                  const meta = SYMBOL_META[t.symbol];
                  const dayRange = t.high - t.low || 1;
                  const fillLeft = ((t.low - t.low) / dayRange) * 100;
                  const fillWidth = Math.min(100, ((t.price - t.low) / dayRange) * 100);
                  const hist = priceHistory[t.symbol] || [t.price, t.price];

                  return (
                    <Tr key={t.symbol} $dir={dir} onClick={() => handleRowClick(t)}>
                      <Td>
                        <SymbolCell>
                          <SymbolIcon $color={meta?.color ?? "var(--accent)"}>
                            {meta?.icon.slice(0, 3) ?? t.symbol.slice(0, 3)}
                          </SymbolIcon>
                          <SymbolName>
                            <span>{t.symbol}</span>
                            <span>{t.name}</span>
                          </SymbolName>
                        </SymbolCell>
                      </Td>
                      <Td>
                        <PriceCell>${formatPrice(t.price, t.symbol)}</PriceCell>
                      </Td>
                      <Td>
                        <Badge $positive={isUp}>
                          {isUp ? "▲" : "▼"} {formatChangePercent(t.changePercent)}
                        </Badge>
                      </Td>
                      <Td>
                        <RangeBar>
                          <RangeTrack>
                            <RangeFill $left={fillLeft} $width={fillWidth} />
                          </RangeTrack>
                          <RangeLabels>
                            <span>${formatPrice(t.low, t.symbol)}</span>
                            <span>${formatPrice(t.high, t.symbol)}</span>
                          </RangeLabels>
                        </RangeBar>
                      </Td>
                      <Td>
                        <ChangeCell $positive={true} style={{ color: "var(--text-secondary)" }}>
                          {formatVolume(t.volume)}
                        </ChangeCell>
                      </Td>
                      <Td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                        {meta?.marketCap ?? "—"}
                      </Td>
                      <Td>
                        <Sparkline data={hist} positive={isUp} width={80} height={28} />
                      </Td>
                      <Td>
                        <FilterBtn
                          $active={false}
                          style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                          onClick={(e) => { e.stopPropagation(); handleRowClick(t); }}
                        >
                          Trade →
                        </FilterBtn>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </Content>
    </Page>
  );
}
