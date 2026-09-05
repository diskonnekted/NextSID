"use client";

// Panel detail satu Kelompok.
// Menampilkan komposisi (StatCell) + tabel anggota paginasi dengan
// link ke detail per penduduk.

import Link from "next/link";

type Info = {
  jenis: string;
  id: number;
  nama: string;
  total: number;
  laki: number;
  perempuan: number;
};

type Baris = {
  id: number;
  nik: string;
  nama: string;
  sex: number | null;
  tempatlahir: string | null;
  tanggallahir: string | null;
  no_kk: string | null;
  hubungan_kk: string | null;
};

type Daftar = {
  baris: Baris[];
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
};

type Props = {
  info: Info;
  label: string;
  daftar: Daftar;
};

function formatTanggalIndo(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function labelJK(sex: number | null): string {
  if (sex === 1) return "L";
  if (sex === 2) return "P";
  return "—";
}

function StatCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-ink/15 bg-paper px-4 py-4">
      <p className="meta">{label}</p>
      <p className="mt-2 font-serif text-2xl tabular-nums">
        {typeof value === "number"
          ? value.toLocaleString("id-ID")
          : value}
      </p>
    </div>
  );
}

function Paginasi({
  halaman,
  totalHalaman,
  baseHref,
}: {
  halaman: number;
  totalHalaman: number;
  baseHref: string;
}) {
  if (totalHalaman <= 1) return null;
  const prev = Math.max(1, halaman - 1);
  const next = Math.min(totalHalaman, halaman + 1);
  return (
    <nav className="mt-4 flex items-center justify-between gap-2 border-t border-ink/10 pt-3 text-sm">
      <p className="meta">
        Halaman {halaman} dari {totalHalaman}
      </p>
      <div className="flex gap-2">
        <Link
          href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}halaman=${prev}`}
          aria-disabled={halaman <= 1}
          className={`meta border border-ink/20 bg-paper px-3 py-1 normal-case tracking-normal ${
            halaman <= 1 ? "pointer-events-none opacity-40" : "hover:border-ink"
          }`}
        >
          ← Sebelumnya
        </Link>
        <Link
          href={`${baseHref}${baseHref.includes("?") ? "&" : "?"}halaman=${next}`}
          aria-disabled={halaman >= totalHalaman}
          className={`meta border border-ink/20 bg-paper px-3 py-1 normal-case tracking-normal ${
            halaman >= totalHalaman
              ? "pointer-events-none opacity-40"
              : "hover:border-ink"
          }`}
        >
          Berikutnya →
        </Link>
      </div>
    </nav>
  );
}

export default function PanelDetailKelompok({ info, label, daftar }: Props) {
  // baseHref pakai hashState dengan query jenis (tanpa halaman)
  // - sudah ada di URL sebagai /admin/kelompok/[jenis]/[id], tidak ada query
  const baseHref = `/admin/kelompok/${info.jenis}/${info.id}`;

  return (
    <div className="space-y-6">
      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCell label={`Kategori ${label}`} value={info.nama} />
        <StatCell label="Total Anggota" value={info.total} />
        <StatCell label="Laki-laki" value={info.laki} />
        <StatCell label="Perempuan" value={info.perempuan} />
      </dl>

      {/* === TABEL ANGGOTA === */}
      <section
        aria-labelledby="anggota-heading"
        className="border border-ink/15 bg-paper"
      >
        <header className="flex flex-col gap-2 border-b border-ink/10 p-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 id="anggota-heading" className="font-serif text-xl">
            Daftar Anggota
          </h3>
          <p className="meta">
            {daftar.total} baris · {daftar.perHalaman} per halaman
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th scope="col" className="px-3 py-2">
                  NIK
                </th>
                <th scope="col" className="px-3 py-2">
                  Nama
                </th>
                <th scope="col" className="px-3 py-2 text-center">
                  JK
                </th>
                <th scope="col" className="px-3 py-2">
                  Tempat, Tgl Lahir
                </th>
                <th scope="col" className="px-3 py-2">
                  No. KK
                </th>
                <th scope="col" className="px-3 py-2">
                  Hubungan KK
                </th>
              </tr>
            </thead>
            <tbody>
              {daftar.baris.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-ink-muted"
                  >
                    Belum ada warga yang tercatat di kelompok ini.
                  </td>
                </tr>
              ) : (
                daftar.baris.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-ink/10 hover:bg-ink/5"
                  >
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {p.nik}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/admin/kependudukan/${p.nik}`}
                        className="font-medium underline decoration-ink/20 underline-offset-2 hover:text-clay hover:decoration-clay"
                      >
                        {p.nama}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums">
                      {labelJK(p.sex)}
                    </td>
                    <td className="px-3 py-2">
                      <div>{p.tempatlahir ?? "—"}</div>
                      <div className="meta text-2xs">
                        {formatTanggalIndo(p.tanggallahir)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {p.no_kk ? (
                        <Link
                          href={`/admin/kependudukan/kk/${p.no_kk}`}
                          className="font-mono text-xs underline decoration-ink/20 underline-offset-2 hover:text-clay hover:decoration-clay"
                        >
                          {p.no_kk}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-ink-muted">
                      {p.hubungan_kk ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <Paginasi
            halaman={daftar.halaman}
            totalHalaman={daftar.totalHalaman}
            baseHref={baseHref}
          />
        </div>
      </section>
    </div>
  );
}