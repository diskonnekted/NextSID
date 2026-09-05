"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { THEME_CATALOG } from "@/lib/themes-registry";
import { COOKIE_THEME, COOKIE_MODE } from "@/lib/theme-switcher";

const VALID_THEMES = new Set(THEME_CATALOG.map((t) => t.key));
type Mode = "light" | "dark";
const VALID_MODES = new Set<Mode>(["light", "dark"]);

/** Set tema (key) — server side, persist via cookie HttpOnly-friendly */
export async function setTema(key: string): Promise<{ ok: boolean; key: string }> {
  if (!VALID_THEMES.has(key)) return { ok: false, key };
  const jar = await cookies();
  jar.set(COOKIE_THEME, key, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true, key };
}

/** Set mode (light | dark) */
export async function setMode(mode: string): Promise<{ ok: boolean; mode: Mode }> {
  if (!VALID_MODES.has(mode as Mode)) return { ok: false, mode: "light" };
  const jar = await cookies();
  jar.set(COOKIE_MODE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true, mode: mode as Mode };
}

/** Set tema + mode sekaligus (1 round-trip untuk switcher yang mengirim keduanya) */
export async function setTemaDanMode(
  key: string,
  mode: string,
): Promise<{ ok: boolean; key: string; mode: Mode }> {
  const temaOk = VALID_THEMES.has(key);
  const modeOk = VALID_MODES.has(mode as Mode);
  if (!temaOk || !modeOk) {
    return { ok: false, key: temaOk ? key : "", mode: modeOk ? (mode as Mode) : "light" };
  }
  const jar = await cookies();
  jar.set(COOKIE_THEME, key, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  jar.set(COOKIE_MODE, mode, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
  return { ok: true, key, mode: mode as Mode };
}