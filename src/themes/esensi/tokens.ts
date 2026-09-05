// Design tokens untuk theme "esensi".
// Override tokens default Tailwind (lihat tailwind.config.ts) di sini.
//
// Cara kerja: tokens ini di-merge ke Tailwind pada saat build
// melalui preset yang dideklarasikan di theme.config.ts + tailwind.config.ts.

const tokens = {
  colors: {
    ink: "#1a1a1a",
    paper: "#fafaf7",
    clay: "#b5482a",
    "ink-soft": "#3d3d3a",
    "ink-muted": "#6b6b66",
    "paper-dim": "#f3f3ed",
  },
  fonts: {
    serif: "Fraunces",
    sans: "Inter",
  },
  radii: {
    // Editorial = sharp. Hindari rounded berlebihan.
    sm: "2px",
    md: "3px",
    lg: "4px",
  },
} as const;

export default tokens;