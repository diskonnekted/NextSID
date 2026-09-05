// Kartu listing Direktori ala TownPress.
// Digunakan di:
//   - halaman /direktori (grid)
//   - halaman beranda (mini section)
//   - halaman detail /direktori/[jenis]/[slug]
// 3 varian: kartu | ringkas (untuk sidebar) | mini (untuk beranda).

import Link from "next/link";
import type { ReactNode } from "react";

export type DirektoriItem = {
  id: number | string;
  slug: string;
  jenis: "lembaga" | "layanan" | "pamong";
  judul: string;
  kategori: string;
  alamat?: string | null;
  kontak?: string | null;
  ikon?: ReactNode;
};

export type DirektoriCardVarian = "kartu" | "ringkas" | "mini";

type Props = {
  item: DirektoriItem;
  varian?: DirektoriCardVarian;
};

function huruf(judul: string): string {
  return (judul.trim().slice(0, 1) || "·").toUpperCase();
}

// Ikon default per jenis: glyph sederhana agar kartu tidak kosong
// ketika tidak ada gambar/logo (kebanyakan direktori desa tidak punya logo).
function IkonDefault({ jenis }: { jenis: DirektoriItem["jenis"] }) {
  if (jenis === "lembaga") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 3 3 8h18z" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" strokeLinejoin="round" />
        <path d="M10 19v-5h4v5" strokeLinejoin="round" />
      </svg>
    );
  }
  if (jenis === "layanan") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M4 6h16v12H4z" strokeLinejoin="round" />
        <path d="M4 9h16" />
        <path d="M9 14h6" strokeLinecap="round" />
      </svg>
    );
  }
  // pamong
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" strokeLinejoin="round" />
    </svg>
  );
}

export function DirektoriCard({ item, varian = "kartu" }: Props) {
  const href = `/direktori/${item.jenis}/${item.slug}`;

  if (varian === "ringkas") {
    return (
      <article className="group flex gap-3 border-b border-ink/10 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 bg-paper text-clay">
          {item.ikon ?? <IkonDefault jenis={item.jenis} />}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={href} className="block">
            <h3 className="font-serif text-base leading-snug group-hover:text-clay">
              {item.judul}
            </h3>
          </Link>
          <p className="meta">{item.kategori}</p>
        </div>
      </article>
    );
  }

  if (varian === "mini") {
    return (
      <Link
        href={href}
        className="group flex items-start gap-3 border-t border-ink/10 py-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink/15 bg-paper text-clay">
          {item.ikon ?? <IkonDefault jenis={item.jenis} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-serif text-base leading-snug group-hover:text-clay">
            {item.judul}
          </h3>
          <p className="meta">{item.kategori}</p>
        </div>
      </Link>
    );
  }

  // kartu
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-ink/15 bg-paper transition-colors hover:border-clay">
      {/* Plate atas: inisial / ikon. TownPress pakai foto logo; kita pakai
          plate monogram supaya kartu tetap informatif walau tanpa gambar. */}
      <div className="flex items-start gap-3 border-b border-ink/10 p-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 bg-paper-dim font-serif text-lg text-clay"
          aria-hidden="true"
        >
          {huruf(item.judul)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="meta truncate">{item.kategori}</p>
          <Link href={href}>
            <h3 className="font-serif text-base leading-snug break-words line-clamp-2 group-hover:text-clay">
              {item.judul}
            </h3>
          </Link>
        </div>
      </div>
      {/* Body: alamat + kontak */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4 text-sm text-ink-soft">
        {item.alamat ? (
          <p className="break-words line-clamp-2">{item.alamat}</p>
        ) : (
          <p className="text-ink-muted">Lokasi belum tercatat.</p>
        )}
        {item.kontak ? <p className="meta truncate">{item.kontak}</p> : null}
      </div>
      {/* Footer: tautan detail ala TownPress */}
      <Link
        href={href}
        className="meta border-t border-ink/10 px-4 py-3 normal-case tracking-normal hover:bg-paper-dim"
      >
        Buka Detail →
      </Link>
    </article>
  );
}

export { IkonDefault as IkonDirektori };
