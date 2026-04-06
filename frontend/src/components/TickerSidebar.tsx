import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { useTickerStore } from "../store/tickerStore";
import { tickersApi } from "../api/endpoints";
import {
  formatPrice,
  formatChangePercent,
  formatVolume,
} from "../utils/format";

// Flash animation when price updates
const flashGreen = keyframes`
  0%   { background-color: var(--green-dim); }
  100% { background-color: transparent; }
`;

const flashRed = keyframes`
  0%   { background-color: var(--red-dim); }
  100% { background-color: transparent; }
`;

const Sidebar = styled.aside`
  width: 260px;
  min-width: 220px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border);
    flex-direction: row;
    overflow-x: auto;
  }
`;

const SidebarHeader = styled.div`
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
`;

const ConnectionDot = styled.span<{ $connected: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${(p) => (p.$connected ? "var(--green)" : "var(--text-muted)")};
  display: inline-block;
  flex-shrink: 0;
  animation: ${(p) =>
    p.$connected
      ? css`${pulse} 2s ease-in-out infinite`
      : "none"};
`;

const TickerList = styled.ul`
  list-style: none;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: flex;
    overflow-y: visible;
  }
`;

const TickerRow = styled.li<{
  $selected: boolean;
  $direction: "up" | "down" | "flat";
}>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  background: ${(p) => (p.$selected ? "var(--bg-hover)" : "transparent")};
  border-left: 3px solid
    ${(p) =>
      p.$selected
        ? p.$direction === "up"
          ? "var(--green)"
          : p.$direction === "down"
          ? "var(--red)"
          : "var(--accent)"
        : "transparent"};
  transition: background var(--transition);

  ${(p) =>
    p.$direction === "up" &&
    css`
      animation: ${flashGreen} 0.6s ease;
    `}

  ${(p) =>
    p.$direction === "down" &&
    css`
      animation: ${flashRed} 0.6s ease;
    `}

  &:hover {
    background: var(--bg-hover);
  }

  @media (max-width: 768px) {
    min-width: 140px;
    border-bottom: none;
    border-right: 1px solid var(--border);
    border-left: none;
    border-top: 3px solid transparent;
  }
`;

const TickerSymbol = styled.div`
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const TickerName = styled.div`
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
`;

const Price = styled.span`
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Change = styled.span<{ $positive: boolean }>`
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  color: ${(p) => (p.$positive ? "var(--green)" : "var(--red)")};
`;

const VolumeRow = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
`;

const SkeletonRow = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
`;

const shimmer = keyframes`
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const SkeletonLine = styled.div<{ w?: string }>`
  height: 10px;
  border-radius: 4px;
  width: ${(p) => p.w || "60%"};
  margin-bottom: 6px;
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    rgba(255, 255, 255, 0.06) 50%,
    var(--border) 75%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.4s infinite linear;
`;

const ErrorState = styled.div`
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.6;

  span {
    color: var(--red);
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
`;

function TickerSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <SkeletonRow key={i}>
          <SkeletonLine w="40%" />
          <SkeletonLine w="70%" />
          <SkeletonLine w="50%" />
        </SkeletonRow>
      ))}
    </>
  );
}

interface Props {
  onSelect: (symbol: string) => void;
}

export default function TickerSidebar({ onSelect }: Props) {
  const { tickers, selectedSymbol, setTickers, isConnected } = useTickerStore();

  // Seed tickers from REST on mount (WebSocket snapshots will overwrite)
  const { data: fetchedTickers, isLoading, isError } = useQuery({
    queryKey: ["tickers"],
    queryFn: tickersApi.getAll,
    refetchInterval: 30000,
    staleTime: 5000,
  });

  // Side-effect: sync REST data into Zustand store
  useEffect(() => {
    if (fetchedTickers) {
      setTickers(fetchedTickers);
    }
  }, [fetchedTickers, setTickers]);

  const tickerList = Object.values(tickers);

  return (
    <Sidebar>
      <SidebarHeader>
        <ConnectionDot $connected={isConnected} />
        {isConnected ? "Live" : "Connecting…"}
      </SidebarHeader>

      <TickerList>
        {isLoading && tickerList.length === 0 ? (
          <TickerSkeleton />
        ) : isError && tickerList.length === 0 ? (
          <ErrorState>
            <span>Failed to load tickers</span>
            Waiting for WebSocket connection…
          </ErrorState>
        ) : (
          tickerList.map((ticker) => {
            const isUp = ticker.changePercent >= 0;
            const direction =
              ticker.change > 0 ? "up" : ticker.change < 0 ? "down" : "flat";

            return (
              <TickerRow
                key={ticker.symbol}
                $selected={ticker.symbol === selectedSymbol}
                $direction={direction}
                onClick={() => onSelect(ticker.symbol)}
                role="button"
                aria-pressed={ticker.symbol === selectedSymbol}
                aria-label={`${ticker.symbol} ${ticker.name}`}
              >
                <TickerName>{ticker.name}</TickerName>
                <TickerSymbol>{ticker.symbol}</TickerSymbol>
                <PriceRow>
                  <Price>${formatPrice(ticker.price, ticker.symbol)}</Price>
                  <Change $positive={isUp}>
                    {formatChangePercent(ticker.changePercent)}
                  </Change>
                </PriceRow>
                <VolumeRow>Vol: {formatVolume(ticker.volume)}</VolumeRow>
              </TickerRow>
            );
          })
        )}
      </TickerList>
    </Sidebar>
  );
}
