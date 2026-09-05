// Theme resolver untuk Surat SID.
// Port dari konsep `theme_path` di OpenSID yang membaca setting default_theme
// lalu mengarahkan view ke storage/app/themes/{nama}/resources/views/.
//
// Di Next.js, setiap theme adalah module di src/themes/{nama}/.
// Module harus mengekspor objek `theme` dengan partials, layouts, config, tokens.

import "server-only";
import { prisma } from "./prisma";
import themeEsensi from "@themes/esensi";

// Peta theme yang tersedia. Tambah theme baru dengan:
//   1. Buat folder src/themes/{nama}/index.ts
//   2. Daftarkan di sini
type ModulTheme = typeof themeEsensi;
const themesTersedia: Record<string, ModulTheme> = {
  esensi: themeEsensi,
};

const DEFAULT_THEME_KEY = process.env.NEXT_PUBLIC_DEFAULT_THEME || "esensi";

export async function ambilThemeAktif(): Promise<ModulTheme> {
  let keyTema: string | null = null;

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "default_theme" },
    });
    keyTema = setting?.value ?? null;
  } catch {
    // DB belum siap / migrasi belum dijalankan. Jangan gagalkan render.
  }

  const keyFinal = keyTema && themesTersedia[keyTema] ? keyTema : DEFAULT_THEME_KEY;
  return themesTersedia[keyFinal] ?? themesTersedia[DEFAULT_THEME_KEY];
}

export async function daftarThemeTersedia() {
  return Object.entries(themesTersedia).map(([key, t]) => ({
    key,
    judul: t.judul,
    versi: t.versi,
    deskripsi: t.deskripsi,
  }));
}

export async function ambilKonfigurasiTema(key: string) {
  const theme = themesTersedia[key];
  return theme?.konfigurasi ?? [];
}

export function themeAsset(key: string, path: string): string {
  // Port dari helper `theme_asset()` OpenSID.
  // Berguna bila theme menyimpan gambar/css di folder sendiri.
  return `/themes/${key}/${path.replace(/^\/+/, "")}`;
}