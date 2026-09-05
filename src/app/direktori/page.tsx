// Halaman Direktori publik ala TownPress — gabungan Lembaga + Layanan + Pamong.
// Filter kategori via search params, paginasi sederhana.

import Link from "next/link";
import { ambilConfig } from "@/lib/queries";
import {
  ambilDirektori,
  filterDirektori,
  hitungKategori,
  type DirektoriFilter,
} from "@/modules/direktori";
import { DirektoriCard } from "@/components/frontend/DirektoriCard";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 12;

function filterValid(s: string | undefined): DirektoriFilter {
  if (s === "lembaga" || s === "layanan" || s === "pamong") return s;
  return "semua";
}

export default async function DirektoriPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; halaman?: string }>;
}) {
  const sp = await searchParams;
  const filter = filterValid(sp.kategori);
  const halaman = Math.max(1, parseInt(sp.halaman ?? "1", 10) || 1);

  const [config, semua] = await Promise.all([ambilConfig(), ambilDirektori()]);
  const terfilter = filterDirektori(semua, filter);
  const kategori = hitungKategori(semua);
  const skip = (halaman - 1) * PER_HALAMAN;
  const tampil = terfilter.slice(skip, skip + PER_HALAMAN);
  const totalHal = Math.max(1, Math.ceil(terfilter.length / PER_HALAMAN));

  return (
    <div className="container-page py-12 lg:py-16">
      {/* Header ala TownPress */}
      <header className="border-b border-ink/15 pb-8">
        <p className="meta mb-2">Direktori Desa</p>
        <h1 className="font-serif text-display-sm leading-tight lg:text-display-md">
          Direktori {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar lembaga masyarakat, layanan publik, dan perangkat desa.
          Pilih kategori untuk menyaring.
        </p>
      </header>

      {/* Tab filter ala TownPress — All / Education / Entertainment / dll */}
      <nav
        aria-label="Filter kategori"
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15 py-3 text-sm"
      >
        {kategori.map((k) => {
          const aktif = k.key === filter;
          const qs = k.key === "semua" ? "" : `?kategori=${k.key}`;
          return (
            <Link
              key={k.key}
              href={`/direktori${qs}`}
              aria-current={aktif ? "page" : undefined}
              className={[
                "inline-flex items-baseline gap-2 border-b-2 pb-2 transition-colors",
                aktif
                  ? "border-clay text-ink"
                  : "border-transparent text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <span className="font-medium">{k.label}</span>
              <span className="meta">{k.jumlah}</span>
            </Link>
          );
        })}
      </nav>

      {/* Grid listing kartu */}
      {tampil.length === 0 ? (
        <div className="mt-12 border border-ink/10 bg-paper-dim p-12 text-center">
          <p className="meta">Tidak ada entri</p>
          <p className="mt-3 text-ink-muted">
            Belum ada entri pada kategori ini. Coba kategori lain atau
            hubungi admin dasbor.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tampil.map((item) => (
            <li key={item.id}>
              <DirektoriCard item={item} varian="kartu" />
            </li>
          ))}
        </ul>
      )}

      {/* Paginasi ala TownPress — panah Previous / angka / Next */}
      {totalHal > 1 ? (
        <nav
          aria-label="Halaman"
          className="mt-12 flex items-center justify-between border-t border-ink/15 pt-6 text-sm"
        >
          <p className="meta">
            Halaman {halaman} dari {totalHal} · {terfilter.length} entri
          </p>
          <div className="flex gap-2">
            {halaman > 1 ? (
              <Link
                href={`/direktori?${new URLSearchParams({
                  ...(filter !== "semua" ? { kategori: filter } : {}),
                  halaman: String(halaman - 1),
                })}`}
                className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
              >
                Sebelumnya
              </Link>
            ) : null}
            {halaman < totalHal ? (
              <Link
                href={`/direktori?${new URLSearchParams({
                  ...(filter !== "semua" ? { kategori: filter } : {}),
                  halaman: String(halaman + 1),
                })}`}
                className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
              >
                Berikutnya
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
