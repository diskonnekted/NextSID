import type { Config } from "tailwindcss";

// Semua warna didefinisikan sebagai CSS variables (lihat src/app/globals.css).
// Ini memungkinkan theme switcher bekerja tanpa rebuild dan konsisten di
// light + dark mode.
//
// Konvensi penamaan CSS variable: --{role}-{tone}.
// Tailwind akan generate utility `bg-{role}-{tone}`, `text-{role}-{tone}`, dll.

const config: Config = {
  darkMode: ["class", '[data-mode="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Skema utama
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        // Derivat
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        "ink-muted": "rgb(var(--ink-muted) / <alpha-value>)",
        "paper-dim": "rgb(var(--paper-dim) / <alpha-value>)",
        "paper-elev": "rgb(var(--paper-elev) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        "accent-strong": "rgb(var(--accent-strong) / <alpha-value>)",
        "accent-fg": "rgb(var(--accent-fg) / <alpha-value>)",
        // Alias kompatibilitas mundur (kode lama pakai `clay` & `clay`)
        // Kita petakan ke accent agar tidak rusak.
        clay: "rgb(var(--accent) / <alpha-value>)",
        "clay-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        // Status warna (konsisten lintas tema)
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        // Border default
        border: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--accent) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["6rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        headline: ["1.5rem", { lineHeight: "1.25" }],
      },
      maxWidth: {
        prose: "68ch",
        page: "1280px",
      },
      borderRadius: {
        // Default sedikit rounded agar tema baru (Nusantara) lebih lembut
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
        md: "var(--radius)",
        lg: "calc(var(--radius) + 4px)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;