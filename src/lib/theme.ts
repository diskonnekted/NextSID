// Theme resolver untuk Surat SID.
// Port dari konsep `theme_path` di OpenSID yang membaca setting default_theme
// lalu mengarahkan view ke storage/app/themes/{nama}/resources/views/.
//
// Di Next.js, setiap theme adalah module di src/themes/{nama}/.
// Module harus mengekspor objek `theme` dengan partials, layouts, config, tokens.
//
// Urutan prioritas tema:
//   1. Cookie `nextsid_theme` (override per-user, lebih kuat dari DB)
//   2. Setting DB `default_theme`
//   3. ENV `NEXT_PUBLIC_DEFAULT_THEME`
//   4. Fallback ke "esensi"

import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import themeEsensi from "@themes/esensi";
import themeNusantara from "@themes/nusantara";
import { THEME_CATALOG, DEFAULT_THEME_KEY } from "./themes-registry";
import { COOKIE_THEME, COOKIE_MODE, DEFAULT_MODE, type Mode as ThemeMode } from "./theme-switcher";

type ModulTheme = typeof themeEsensi;

const modulesByKey: Record<string, ModulTheme> = {
  esensi: themeEsensi,
  nusantara: themeNusantara,
};

// Validasi: setiap key di katalog harus punya module
const VALID_KEYS = new Set(Object.keys(modulesByKey));
export function daftarTemaTersedia() {
  return THEME_CATALOG
    .filter((e) => VALID_KEYS.has(e.key))
    .map((e) => {
      const m = modulesByKey[e.key];
      return {
        ...e,
        judul: m.judul ?? m.name,
        name: m.name,
        versi: m.versi,
        deskripsi: m.deskripsi,
      };
    });
}

/** Map module tema, dipakai server-side untuk resolve partials/layouts. */
export const themesTersedia = modulesByKey;

/** Ambil tema + mode efektif dari cookie > DB > ENV > default. */
export async function ambilThemeAktif(): Promise<ModulTheme> {
  // 1. Cookie user (override terkuat, supaya switcher langsung berefek)
  try {
    const jar = await cookies();
    const cookieKey = jar.get(COOKIE_THEME)?.value;
    if (cookieKey && VALID_KEYS.has(cookieKey)) {
      return modulesByKey[cookieKey];
    }
  } catch {
    // cookies() mungkin gagal di luar request context
  }

  // 2. Setting DB
  let keyTema: string | null = null;
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "default_theme" },
    });
    keyTema = setting?.value ?? null;
  } catch {
    // DB belum siap / migrasi belum dijalankan. Jangan gagalkan render.
  }

  // 3. ENV → fallback
  const keyFinal = keyTema && VALID_KEYS.has(keyTema)
    ? keyTema
    : (process.env.NEXT_PUBLIC_DEFAULT_THEME || DEFAULT_THEME_KEY);

  return modulesByKey[keyFinal] ?? modulesByKey[DEFAULT_THEME_KEY];
}

/** Ambil mode (light | dark) efektif dari cookie user. */
export async function ambilModeAktif(): Promise<ThemeMode> {
  try {
    const jar = await cookies();
    const cookieMode = jar.get(COOKIE_MODE)?.value;
    if (cookieMode === "light" || cookieMode === "dark") {
      return cookieMode;
    }
  } catch {
    // ignore
  }
  return DEFAULT_MODE;
}

export async function ambilKonfigurasiTema(key: string) {
  const theme = modulesByKey[key];
  return theme?.konfigurasi ?? [];
}

export function themeAsset(key: string, path: string): string {
  // Port dari helper `theme_asset()` OpenSID.
  // Berguna bila theme menyimpan gambar/css di folder sendiri.
  return `/themes/${key}/${path.replace(/^\/+/, "")}`;
}