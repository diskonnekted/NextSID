// Halaman Kelompok.
// Modul OpenSID: kelompok + kelompok_anggota.
//
// Untuk saat ini, "kelompok" didekati dengan pengelompokan warga
// berdasarkan pekerjaan (RefPekerjaan). Tabel menampilkan agregat
// jumlah warga per kelompok pekerjaan, dengan referensi jumlah
// laki-laki dan perempuan.
//
// Catatan: jika di kemudian hari ada tabel kelompok khusus dengan
// keanggotaan, modul ini akan diperluas.

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminKelompokPage() {
  const pekerjaan = await prisma.refPekerjaan.findMany({
    orderBy: { nama: "asc" },
  });

  // Untuk setiap kelompok pekerjaan, hitung jumlah anggota + JK
  const rows = await Promise.all(
    pekerjaan.map(async (p) => {
      const [total, laki, perempuan] = await Promise.all([
        prisma.penduduk.count({ where: { pekerjaan_id: p.id } }),
        prisma.penduduk.count({ where: { pekerjaan_id: p.id, sex: 1 } }),
        prisma.penduduk.count({ where: { pekerjaan_id: p.id, sex: 2 } }),
      ]);
      return {
        id: p.id,
        nama: p.nama,
        total,
        laki,
        perempuan,
      };
    }),
  );

  const totalSeluruh = rows.reduce((acc, r) => acc + r.total, 0);
  const totalKK = await prisma.keluarga.count();

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
        <span className="text-ink">Kelompok</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · Kelompok</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Kelompok
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Pengelompokan warga berdasarkan pekerjaan. Tiap baris menunjukkan
          satu kelompok dengan jumlah anggota, komposisi laki-laki dan
          perempuan.
        </p>
      </header>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10">
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Kelompok</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {rows.length.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Warga</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalSeluruh.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total KK</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalKK.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>

      {/* === TABEL === */}
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">Kelompok (Pekerjaan)</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Laki-laki</th>
              <th className="px-3 py-2 text-right">Perempuan</th>
              <th className="px-3 py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-ink-muted"
                >
                  Belum ada data kelompok.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const persen =
                totalSeluruh > 0
                  ? ((row.total / totalSeluruh) * 100).toFixed(1)
                  : "0";
              return (
                <tr
                  key={row.id}
                  className="border-t border-ink/10 hover:bg-ink/5"
                >
                  <td className="px-3 py-2 font-medium">{row.nama}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.laki.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.perempuan.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-muted">
                    {persen}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <p className="text-ink-muted">
          Catatan: saat ini kelompok direpresentasikan oleh
          <code className="mx-1 rounded bg-ink/5 px-1.5 py-0.5 text-xs">
            ref_pekerjaan
          </code>
          . Modul penuh (tabel kelompok + anggota) menyusul.
        </p>
        <Link
          href="/admin/kependudukan"
          className="link-clay mt-2 inline-block"
        >
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}