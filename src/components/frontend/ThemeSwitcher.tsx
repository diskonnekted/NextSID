"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  getEffectiveTheme,
  setThemeAndMode,
  toggleMode,
  daftarOpsiTema,
  DEFAULT_THEME,
  DEFAULT_MODE,
  type Mode,
} from "@/lib/theme-switcher";

/**
 * ThemeSwitcher — dropdown mini untuk pilih tema + toggle dark/light.
 * Render di footer publik. Server-side aman: render placeholder sampai
 * mounted untuk menghindari hydration mismatch.
 */
export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<{ theme: string; mode: Mode }>({
    theme: DEFAULT_THEME,
    mode: DEFAULT_MODE,
  });
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setActive(getEffectiveTheme());

    // Tutup dropdown saat klik di luar
    const onClickOutside = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pilihTema = useCallback((key: string) => {
    const next = { ...active, theme: key };
    setActive(next);
    setThemeAndMode(key, next.mode);
    setOpen(false);
  }, [active]);

  const toggleDark = useCallback(() => {
    const next: Mode = active.mode === "dark" ? "light" : "dark";
    const updated = { ...active, mode: next };
    setActive(updated);
    setThemeAndMode(active.theme, next);
  }, [active]);

  const opsi: Array<{ key: string; name: string }> = daftarOpsiTema();
  const temaAktif = opsi.find((o) => o.key === active.theme)?.name ?? "Esensi";

  // Placeholder sebelum mount supaya SSR aman & tidak flicker
  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-ink-muted">
        <span className="hidden sm:inline">Tema:</span>
        <span className="rounded-full border border-ink/15 px-3 py-1">Esensi</span>
      </div>
    );
  }

  return (
    <div ref={dropRef} className="relative inline-flex items-center gap-2 text-xs">
      <span className="hidden text-ink-muted sm:inline">Tema:</span>

      {/* Tombol toggle tema */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-paper-elev px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent"
      >
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: "rgb(var(--accent))" }}
        />
        {temaAktif}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-ink/15 bg-paper-elev py-1 shadow-lg"
        >
          {opsi.map((o) => {
            const selected = o.key === active.theme;
            return (
              <li key={o.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => pilihTema(o.key)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-accent/10 text-accent"
                      : "text-ink hover:bg-paper-dim"
                  }`}
                >
                  <span className="font-medium">{o.name}</span>
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M2 7l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Tombol toggle mode */}
      <button
        type="button"
        onClick={toggleDark}
        aria-label={active.mode === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        title={active.mode === "dark" ? "Mode terang" : "Mode gelap"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 bg-paper-elev text-ink transition-colors hover:border-accent hover:text-accent"
      >
        {active.mode === "dark" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}