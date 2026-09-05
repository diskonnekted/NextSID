"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cariMenuAktif } from "./_menu";

export function TopbarAdmin() {
  const pathname = usePathname() || "/admin";
  const aktif = cariMenuAktif(pathname);
  const sectionLabel = aktif?.section.label;
  const judul = aktif?.item.label ?? "Dasbor";
  const diRoot = pathname === "/admin";

  return (
    <header className="sticky top-0 z-20 border-b border-ink/15 bg-paper/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-10">
        {/* Judul halaman + breadcrumb */}
        <div className="min-w-0">
          <nav
            aria-label="breadcrumb"
            className="mb-1 flex items-center gap-2 text-2xs text-ink-muted"
          >
            <Link href="/admin" className="hover:text-clay">
              Dasbor
            </Link>
            {sectionLabel && !diRoot && (
              <>
                <span aria-hidden="true">/</span>
                <span>{sectionLabel}</span>
              </>
            )}
            {!diRoot && aktif && aktif.item.href !== "/admin" && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-ink">{judul}</span>
              </>
            )}
          </nav>
          <h1 className="font-serif text-lg leading-tight lg:text-xl">{judul}</h1>
        </div>

        {/* Aksi kanan: tautan singkat */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://github.com/opensid/opensid"
            target="_blank"
            rel="noopener noreferrer"
            className="meta hidden border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink lg:inline-block"
          >
            Dokumentasi
          </a>
        </div>
      </div>
    </header>
  );
}
