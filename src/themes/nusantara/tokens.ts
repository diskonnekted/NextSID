// Design tokens untuk theme "nusantara".
// Tema vibrant & colorful untuk portal desa — lebih berwarna dari esensi.
// Skema warna didefinisikan di globals.css dengan CSS variables per
// [data-theme="nusantara"] + [data-mode]. File ini hanya metadata untuk
// dokumentasi & preset tooling.

const tokens = {
  colors: {
    ink: "#0F172A",
    paper: "#F8FAFC",
    accent: "#2563EB",
    "ink-soft": "#334155",
    "ink-muted": "#64748B",
    "paper-dim": "#F1F5F9",
    info: "#0EA5E9",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
  },
  fonts: {
    serif: "Fraunces",
    sans: "Inter",
  },
  radii: {
    // Lebih lembut & modern dari esensi (sharp). Cocok untuk blok vibrant.
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },
  // Gradien khas nusantara
  gradients: {
    tri: "linear-gradient(135deg, #2563EB 0%, #0EA5E9 50%, #D97706 100%)",
    hero: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
    warm: "linear-gradient(135deg, #D97706 0%, #DC2626 100%)",
  },
} as const;

export default tokens;