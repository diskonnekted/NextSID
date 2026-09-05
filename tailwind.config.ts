import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#fafaf7",
        clay: "#b5482a",
        "ink-soft": "#3d3d3a",
        "ink-muted": "#6b6b66",
        "paper-dim": "#f3f3ed",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Modular scale 1.25 (major third)
        "display-xl": ["6rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "headline": ["1.5rem", { lineHeight: "1.25" }],
      },
      maxWidth: {
        prose: "68ch",
        page: "1280px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
