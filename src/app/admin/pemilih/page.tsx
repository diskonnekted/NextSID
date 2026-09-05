// Halaman Calon Pemilih.
// Modul OpenSID: daftar_calon_pemilih berdasarkan umur (>=17 th) & status WNI.
//
// Daftar dihitung dari tabel Penduduk:
//   - status_dasar = 1 (Hidup)
//   - tanggallahir != null
//   - usia >= 17 tahun
//   - warganegara_id = 1 (WNI)
//
// Ditampilkan sebagai tabel (NIK, nama, JK, umur, alamat, dusun/RW/RT).

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatTanggal(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function hitungUsia(tgl: Date): number {
  const now = new Date();
  const diff = now.getTime() - tgl.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function labelJK(sex: number | null): string {
  if (sex === 1) return "Laki-laki";
  if (sex === 2) return "Perempuan";
  return "—";
}

export default async function AdminPemilihPage({
  searchParams,
}: {
  searchParams: Promise<{ halaman?: string; perHalaman?: string }>;
}) {
  const sp = await searchParams;
  const halaman = Math.max(1, parseInt(sp.halaman ?? "1", 10) || 1);
  const perHalaman = Math.min(100, Math.max(5, parseInt(sp.perHalaman ?? "20", 10) || 20));
  const skip = (halaman - 1) * perHalaman;

  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 17);

  // Ambil semua penduduk yang lahir sebelum cutoff (>=17 th) dan masih hidup
  const where = {
    status_dasar: 1,
    warganegara_id: 1,
    tanggallahir: { lte: cutoff },
  } as const;

  const [total, daftar] = await Promise.all([
    prisma.penduduk.count({ where }),
    prisma.penduduk.findMany({
      where,
      skip,
      take: perHalaman,
      orderBy: { tanggallahir: "desc" },
      include: {
        keluarga: {
          select: { alamat: true, dusun: true, rw: true, rt: true },
        },
      },
    }),
  ]);

  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));

  // Statistik tambahan
  const [laki, perempuan] = await Promise.all([
    prisma.penduduk.count({ where: { ...where, sex: 1 } }),
    prisma.penduduk.count({ where: { ...where, sex: 2 } }),
  ]);

  function buatLink(h: number): string {
    const params = new URLSearchParams();
    params.set("halaman", String(h));
    params.set("perHalaman", String(perHalaman));
    return `/admin/pemilih?${params.toString()}`;
  }

  return (
    <div className="space-y-8">
      {/* === BREADCRUMB === */}
      <nav className="meta flex items-center gap-2">
        <Link href="/" className="hover:text-clay">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin" className="hover:text-clay">
          Dasbor
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/kependudukan" className="hover:text-clay">
          Kependudukan
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Calon Pemilih</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · Calon Pemilih</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Calon Pemilih
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Estimasi awal calon pemilih dari data penduduk ber-usia 17 tahun ke
          atas, WNI, dan berstatus Hidup. Roster resmi (TPS, dll.) menunggu
          integrasi lebih lanjut.
        </p>
      </header>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Calon</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {total.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Laki-laki</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {laki.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Perempuan</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {perempuan.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Batas Usia</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">≥ 17 th</dd>
        </div>
      </dl>

      {/* === TABEL === */}
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">NIK</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">JK</th>
              <th className="px-3 py-2 text-right">Usia</th>
              <th className="px-3 py-2">Tgl Lahir</th>
              <th className="px-3 py-2">Dusun / RW / RT</th>
            </tr>
          </thead>
          <tbody>
            {daftar.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-ink-muted"
                >
                  Belum ada calon pemilih yang memenuhi syarat.
                </td>
              </tr>
            )}
            {daftar.map((p) => {
              const usia = p.tanggallahir ? hitungUsia(p.tanggallahir) : 0;
              return (
                <tr key={p.id} className="border-t border-ink/10 hover:bg-ink/5">
                  <td className="px-3 py-2 font-mono text-xs">{p.nik}</td>
                  <td className="px-3 py-2 font-medium">
                    {p.nama}
                  </td>
                  <td className="px-3 py-2 text-ink-muted">
                    {labelJK(p.sex)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {usia.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-ink-muted">
                    {formatTanggal(p.tanggallahir)}
                  </td>
                  <td className="px-3 py-2 text-ink-muted">
                    {[
                      p.keluarga?.dusun,
                      p.keluarga?.rw && `RW ${p.keluarga.rw}`,
                      p.keluarga?.rt && `RT ${p.keluarga.rt}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* === PAGINASI === */}
      <nav className="flex items-center justify-between text-sm">
        <p className="meta">
          Halaman {halaman.toLocaleString("id-ID")} dari{" "}
          {totalHalaman.toLocaleString("id-ID")} ·{" "}
          {total.toLocaleString("id-ID")} calon
        </p>
        <div className="flex gap-2">
          {halaman > 1 && (
            <Link
              href={buatLink(halaman - 1)}
              className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
            >
              Sebelumnya
            </Link>
          )}
          {halaman < totalHalaman && (
            <Link
              href={buatLink(halaman + 1)}
              className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
            >
              Berikutnya
            </Link>
          )}
        </div>
      </nav>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <p className="text-ink-muted">
          Kriteria: status Hidup (1), WNI (1), tanggal lahir sebelum{" "}
          {formatTanggal(cutoff)}.
        </p>
        <Link href="/admin/kependudukan" className="link-clay mt-2 inline-block">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}