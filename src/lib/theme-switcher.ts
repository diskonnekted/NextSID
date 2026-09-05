/**
 * Helper client-side untuk theme switcher.
 * - Baca cookie tema aktif
 * - Sinkronkan <html data-theme data-mode> dengan cookie + system preference
 *
 * Aman dipakai di client component — TIDAK mengimpor dari @/lib/theme
 * yang ber-marker "server-only". Pakai THEME_CATALOG dari registry statis.
 */

import { THEME_CATALOG, DEFAULT_THEME_KEY } from "./themes-registry";

export const COOKIE_THEME = "nextsid_theme";
export const COOKIE_MODE = "nextsid_mode";

export type Mode = "light" | "dark";

export const DEFAULT_THEME = DEFAULT_THEME_KEY;
export const DEFAULT_MODE: Mode = "light";

const VALID_THEMES = new Set(THEME_CATALOG.map((t) => t.key));
const VALID_MODES = new Set<Mode>(["light", "dark"]);

/** Ambil cookie di browser (jauh lebih sederhana dari next/headers di client) */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 86400_000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getSystemMode(): Mode {
  if (typeof window === "undefined") return DEFAULT_MODE;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Ambil tema efektif di client (dipakai untuk UI switcher & pre-hydration) */
export function getEffectiveTheme(): { theme: string; mode: Mode } {
  const cookieTheme = readCookie(COOKIE_THEME);
  const cookieMode = readCookie(COOKIE_MODE);

  const theme = cookieTheme && VALID_THEMES.has(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const mode = cookieMode && VALID_MODES.has(cookieMode as Mode)
    ? (cookieMode as Mode)
    : getSystemMode();

  return { theme, mode };
}

/** Terapkan tema + mode ke <html> */
export function applyTheme(theme: string, mode: Mode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-mode", mode);
}

/** Set tema + mode baru + persist ke cookie + apply ke DOM */
export function setThemeAndMode(theme: string, mode: Mode): void {
  if (!VALID_THEMES.has(theme)) return;
  if (!VALID_MODES.has(mode)) return;
  writeCookie(COOKIE_THEME, theme);
  writeCookie(COOKIE_MODE, mode);
  applyTheme(theme, mode);
}

/** Toggle light <-> dark saja (tema tetap) */
export function toggleMode(): void {
  const cur = getEffectiveTheme();
  const next: Mode = cur.mode === "dark" ? "light" : "dark";
  setThemeAndMode(cur.theme, next);
}

/**
 * Script pre-hydration: render inline di <head> sebelum React mount
 * untuk mencegah flash of wrong theme saat switch.
 */
export const PRE_HYDRATION_SCRIPT = `
(function () {
  try {
    var VALID = ${JSON.stringify([...VALID_THEMES])};
    var DEFAULT_THEME = ${JSON.stringify(DEFAULT_THEME)};
    var DEFAULT_MODE = ${JSON.stringify(DEFAULT_MODE)};
    function readCookie(n) {
      var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    }
    var cookieTheme = readCookie('${COOKIE_THEME}');
    var cookieMode = readCookie('${COOKIE_MODE}');
    var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = (cookieTheme && VALID.indexOf(cookieTheme) !== -1) ? cookieTheme : DEFAULT_THEME;
    var mode = (cookieMode === 'light' || cookieMode === 'dark') ? cookieMode : (sysDark ? 'dark' : DEFAULT_MODE);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
  } catch (e) {}
})();
`.trim();

/** Daftar opsi tema untuk UI switcher */
export function daftarOpsiTema() {
  return THEME_CATALOG.map((t) => ({
    key: t.key,
    name: t.name,
  }));
}