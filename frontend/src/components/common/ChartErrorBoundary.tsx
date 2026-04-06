import { Component, type ReactNode } from "react";
import styled from "styled-components";

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.75rem;
  color: var(--text-muted);
  text-align: center;
`;

const Title = styled.p`
  font-weight: 600;
  color: var(--text-secondary);
`;

const RetryBtn = styled.button`
  padding: 0.4rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.82rem;
  transition: border-color var(--transition), color var(--transition);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err: unknown): State {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box>
          <Title>Chart failed to render</Title>
          <p style={{ fontSize: "0.8rem" }}>{this.state.message}</p>
          <RetryBtn onClick={this.handleReset}>Try again</RetryBtn>
        </Box>
      );
    }
    return this.props.children;
  }
}
