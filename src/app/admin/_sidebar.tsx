"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { menuAdmin, type MenuSection } from "./_menu";

export function Sidebar() {
  const pathname = usePathname() || "/admin";
  const [buka, setBuka] = useState(false);
  const [bukaSection, setBukaSection] = useState<Record<string, boolean>>({});
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Administrator";
  const userEmail = session?.user?.email ?? "";

  // Setiap kali pathname berubah, buka section yang berisi item aktif.
  // Tanpa ini, navigasi Next.js (tanpa remount) tidak membuka sub-menu.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const s of menuAdmin) {
      const adaAktif = s.items.some(
        (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
      );
      next[s.label] = !!adaAktif;
    }
    setBukaSection(next);
  }, [pathname]);

  function toggleSection(label: string) {
    setBukaSection((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <>
      {/* Tombol buka/tutup untuk mobile */}
      <button
        type="button"
        aria-label={buka ? "Tutup menu dasbor" : "Buka menu dasbor"}
        aria-expanded={buka}
        onClick={() => setBuka((v) => !v)}
        className="fixed left-4 top-4 z-40 inline-flex items-center justify-center border border-ink/20 bg-paper p-2 text-ink shadow-md lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5"
        >
          {buka ? (
            <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
          ) : (
            <>
              <path d="M4 7h16" strokeLinecap="round" />
              <path d="M4 12h16" strokeLinecap="round" />
              <path d="M4 17h16" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Backdrop untuk mobile */}
      {buka && (
        <button
          type="button"
          aria-label="Tutup menu dasbor"
          onClick={() => setBuka(false)}
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Menu dasbor"
        data-state={buka ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-ink/15 bg-paper transition-transform duration-200 lg:static lg:translate-x-0 lg:w-72"
        style={{
          transform: buka ? "translateX(0)" : undefined,
        }}
      >
        {/* Brand */}
        <div className="flex items-baseline gap-2 border-b border-ink/15 px-6 py-5">
          <Link href="/admin" className="flex items-baseline gap-2" onClick={() => setBuka(false)}>
            <span className="inline-block h-2 w-2 bg-clay" aria-hidden="true" />
            <span className="font-serif text-lg leading-none">Dasbor Desa</span>
          </Link>
        </div>

        {/* Daftar menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuAdmin.map((section: MenuSection) => {
              // Section dengan 1 item langsung dirender sebagai link.
              if (section.items.length === 1) {
                const item = section.items[0];
                const aktif =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                return (
                  <li key={section.label}>
                    <Link
                      href={item.href}
                      onClick={() => setBuka(false)}
                      aria-current={aktif ? "page" : undefined}
                      className={[
                        "group flex items-start gap-3 px-3 py-2.5 text-sm transition-colors",
                        aktif
                          ? "border-l-2 border-clay bg-ink/5 text-ink"
                          : "border-l-2 border-transparent text-ink-soft hover:bg-ink/[0.03] hover:text-ink",
                      ].join(" ")}
                    >
                      <section.ikon
                        className={[
                          "mt-0.5 h-4 w-4 shrink-0",
                          aktif ? "text-clay" : "text-ink-muted group-hover:text-ink",
                        ].join(" ")}
                      />
                      <span className="flex-1">
                        <span className="block font-medium leading-tight">
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              }

              // Section dengan banyak item = parent collapsible.
              const terbuka = !!bukaSection[section.label];
              const sectionAktif = section.items.some(
                (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
              );
              return (
                <li key={section.label}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.label)}
                    aria-expanded={terbuka}
                    className={[
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors focus:outline-none focus-visible:bg-ink/5",
                      sectionAktif
                        ? "text-clay"
                        : "text-ink-muted hover:text-ink hover:bg-ink/[0.03]",
                    ].join(" ")}
                  >
                    <section.ikon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">{section.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className={[
                        "h-3 w-3 shrink-0 transition-transform",
                        terbuka ? "rotate-90" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {terbuka && (
                    <ul className="mt-0.5 space-y-0.5">
                      {section.items.map((item) => {
                        const aktif =
                          pathname === item.href ||
                          (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setBuka(false)}
                              aria-current={aktif ? "page" : undefined}
                              className={[
                                "group flex items-start gap-3 px-3 py-2 text-sm transition-colors",
                                aktif
                                  ? "border-l-2 border-clay bg-ink/5 text-ink"
                                  : "border-l-2 border-transparent text-ink-soft hover:bg-ink/[0.03] hover:text-ink",
                              ].join(" ")}
                            >
                              <item.ikon
                                className={[
                                  "mt-0.5 h-4 w-4 shrink-0",
                                  aktif
                                    ? "text-clay"
                                    : "text-ink-muted group-hover:text-ink",
                                ].join(" ")}
                              />
                              <span className="flex-1">
                                <span className="block font-medium leading-tight">
                                  {item.label}
                                </span>
                                {item.deskripsi && (
                                  <span className="meta mt-0.5 block text-2xs normal-case tracking-normal">
                                    {item.deskripsi}
                                  </span>
                                )}
                              </span>
                              {item.rintisan && (
                                <span className="meta ml-1 inline-block border border-ink/20 px-1 py-0.5 text-2xs normal-case tracking-normal">
                                  Rintisan
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User block + keluar */}
        <div className="border-t border-ink/15 px-4 py-4">
          <div className="mb-3 flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/20 bg-ink/5 font-serif text-sm"
              aria-hidden="true"
            >
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">
                {userName}
              </p>
              <p className="truncate text-xs text-ink-muted">{userEmail}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="meta inline-flex items-center justify-center border border-ink/20 px-3 py-2 text-center normal-case tracking-normal hover:border-ink hover:bg-ink hover:text-paper"
            >
              Lihat Situs
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="meta inline-flex items-center justify-center border border-clay bg-clay px-3 py-2 text-paper normal-case tracking-normal hover:bg-clay/90"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
