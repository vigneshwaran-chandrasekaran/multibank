import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { authApi } from "../api/endpoints";
import { useAuthStore } from "../store/authStore";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 1rem;
  position: relative;
  overflow: hidden;

  /* subtle radial glow behind card */
  &::before {
    content: "";
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse at center, rgba(200, 168, 75, 0.07) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2.5rem 2rem;
  animation: ${fadeIn} 0.3s ease;
  position: relative;
  z-index: 1;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LogoMark = styled.div`
  width: 44px;
  height: 44px;
  background: var(--accent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: #0b0c0f;
  margin: 0 auto 0.75rem;
`;

const BrandName = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;

  span {
    color: var(--accent);
  }
`;

const BrandSub = styled.p`
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
  letter-spacing: 0.3px;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border);
  margin: 1.5rem 0;
`;

const SectionTitle = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 1.25rem;
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
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.3px;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.65rem 0.85rem;
  background: var(--bg-card);
  border: 1px solid ${(p) => (p.$hasError ? "var(--red)" : "var(--border)")};
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 100%;
  transition: border-color var(--transition);

  &:focus {
    outline: none;
    border-color: ${(p) => (p.$hasError ? "var(--red)" : "var(--accent)")};
    box-shadow: 0 0 0 2px ${(p) => (p.$hasError ? "rgba(246,70,93,0.12)" : "rgba(200,168,75,0.12)")};
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  padding: 0.75rem;
  background: var(--accent);
  color: #0b0c0f;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  letter-spacing: 0.3px;
  transition: opacity var(--transition), transform var(--transition), background var(--transition);
  opacity: ${(p) => (p.$loading ? 0.7 : 1)};
  pointer-events: ${(p) => (p.$loading ? "none" : "auto")};

  &:hover {
    background: var(--accent-hover);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ErrorBanner = styled.div`
  padding: 0.6rem 0.85rem;
  background: var(--red-dim);
  border: 1px solid rgba(246, 70, 93, 0.35);
  border-radius: var(--radius-sm);
  color: var(--red);
  font-size: 0.82rem;
`;

const Hint = styled.p`
  text-align: center;
  color: var(--text-muted);
  font-size: 0.74rem;
  margin-top: 1.25rem;
  line-height: 1.5;
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

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
      navigate("/", { replace: true });
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
          <LogoMark>MB</LogoMark>
          <BrandName>Multi<span>Bank</span></BrandName>
          <BrandSub>TradeFi Platform</BrandSub>
        </Logo>

        <Divider />
        <SectionTitle>Sign in to your account</SectionTitle>

        <Form onSubmit={handleSubmit} noValidate>
          {error && <ErrorBanner role="alert">{error}</ErrorBanner>}

          <Field>
            <Label htmlFor="email">Email address</Label>
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
            {loading ? "Authenticating…" : "Sign In"}
          </SubmitButton>
        </Form>

        <Hint>Demo: use any email + password to sign in</Hint>
      </Card>
    </Wrapper>
  );
}
