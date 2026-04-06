import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    /* MultibankGroup tradfi dark theme */
    --bg-primary:   #0b0c0f;
    --bg-secondary: #111318;
    --bg-card:      #181a21;
    --bg-hover:     #1f2130;
    --border:       #252830;

    --text-primary:   #f0f1f5;
    --text-secondary: #9ca3b2;
    --text-muted:     #5c6270;

    /* MB brand gold */
    --accent:     #c8a84b;
    --accent-dim: #2a2214;
    --accent-hover: #d9bb6a;

    /* Financial green / red */
    --green:     #0ecb81;
    --green-dim: #0a2a1c;
    --red:       #f6465d;
    --red-dim:   #2a0e14;

    --yellow: #f0b90b;

    --radius:    6px;
    --radius-sm: 4px;
    --font-mono: "JetBrains Mono", "Fira Code", monospace;
    --transition: 150ms ease;
  }

  html {
    font-size: 14px;
  }

  body {
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
    width: 5px;
    height: 5px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent);
  }
`;
