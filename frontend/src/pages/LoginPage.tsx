import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { authApi } from "../api/endpoints";
import { useAuthStore } from "../store/authStore";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 1rem;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2.5rem 2rem;
  animation: ${fadeIn} 0.3s ease;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
`;

const Icon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.65rem 0.85rem;
  background: var(--bg-card);
  border: 1px solid ${(p) => (p.$hasError ? "var(--red)" : "var(--border)")};
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.95rem;
  width: 100%;
  transition: border-color var(--transition);

  &:focus {
    outline: none;
    border-color: ${(p) => (p.$hasError ? "var(--red)" : "var(--accent)")};
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  padding: 0.75rem;
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  transition: opacity var(--transition), transform var(--transition);
  opacity: ${(p) => (p.$loading ? 0.7 : 1)};
  pointer-events: ${(p) => (p.$loading ? "none" : "auto")};

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ErrorBanner = styled.div`
  padding: 0.6rem 0.85rem;
  background: var(--red-dim);
  border: 1px solid var(--red);
  border-radius: var(--radius-sm);
  color: var(--red);
  font-size: 0.85rem;
`;

const Hint = styled.p`
  text-align: center;
  color: var(--text-muted);
  font-size: 0.78rem;
  margin-top: 1rem;
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      setAuth(res.token, res.user);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Logo>
          <Icon>📈</Icon>
          <h1>TradeDash</h1>
          <p>Real-time crypto &amp; stock dashboard</p>
        </Logo>

        <Form onSubmit={handleSubmit} noValidate>
          {error && <ErrorBanner role="alert">{error}</ErrorBanner>}

          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              $hasError={!!error}
            />
          </Field>

          <Field>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              $hasError={!!error}
            />
          </Field>

          <SubmitButton type="submit" $loading={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </SubmitButton>
        </Form>

        <Hint>Use any email + password to sign in (mocked auth)</Hint>
      </Card>
    </Wrapper>
  );
}
