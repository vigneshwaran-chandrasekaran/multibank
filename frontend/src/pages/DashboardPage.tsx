import styled from "styled-components";
import Navbar from "../components/layout/Navbar";
import TickerSidebar from "../components/TickerSidebar";
import PriceChart from "../components/PriceChart";
import AlertPanel from "../components/AlertPanel";
import { ChartErrorBoundary } from "../components/common/ChartErrorBoundary";
import { useTickerStore } from "../store/tickerStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAlerts } from "../hooks/useAlerts";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-primary);
`;

export default function DashboardPage() {
  // Connect WebSocket and keep store updated
  useWebSocket();
  // Watch alerts
  useAlerts();

  const setSelectedSymbol = useTickerStore((s) => s.setSelectedSymbol);

  return (
    <Layout>
      <Navbar />
      <Body>
        <TickerSidebar onSelect={setSelectedSymbol} />
        <Main>
          <ChartErrorBoundary>
            <PriceChart />
          </ChartErrorBoundary>
        </Main>
        <AlertPanel />
      </Body>
    </Layout>
  );
}
