import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --bg-primary: #0d1117;
    --bg-secondary: #161b22;
    --bg-card: #1c2128;
    --bg-hover: #21262d;
    --border: #30363d;
    --text-primary: #e6edf3;
    --text-secondary: #8b949e;
    --text-muted: #6e7681;
    --green: #3fb950;
    --green-dim: #1a3a24;
    --red: #f85149;
    --red-dim: #3a1a1a;
    --accent: #58a6ff;
    --accent-dim: #1a2a3a;
    --yellow: #d29922;
    --radius: 8px;
    --radius-sm: 4px;
    --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
    --transition: 150ms ease;
  }

  html {
    font-size: 14px;
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      sans-serif;
    line-height: 1.5;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: var(--accent);
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
  }

  input {
    font: inherit;
    color: inherit;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
`;
