/**
 * Registry statis tema — boleh dipakai di client & server.
 * Hanya berisi KEY + NAME; partials/layouts/tokens tetap di @themes/{nama}.
 *
 * Tambahkan tema baru dengan:
 *   1. Buat folder src/themes/{nama}/index.ts (ekspor `theme` lengkap)
 *   2. Daftarkan di src/lib/theme.ts (server side resolver)
 *   3. Tambah entry di array THEME_CATALOG di bawah ini untuk switcher UI
 */

export type ThemeEntry = {
  key: string;
  name: string;
};

export const THEME_CATALOG: ThemeEntry[] = [
  { key: "esensi", name: "Esensi" },
  { key: "nusantara", name: "Nusantara" },
];

export const DEFAULT_THEME_KEY = "esensi";