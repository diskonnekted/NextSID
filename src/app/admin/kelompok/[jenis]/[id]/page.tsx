// Halaman Kelompok.
// Tabel rekap pengelompokan warga berdasarkan 6 referensi demografis:
// Pekerjaan, Pendidikan, Agama, Status Kawin, Kewarganegaraan, Golongan
// Darah. Jenis kelompok dipilih via searchParams (?jenis=pekerjaan).
// Setiap baris menaut ke halaman detail per kelompok.

import Link from "next/link";
import {
  JENIS_KELOMPOK,
  LABEL_JENIS_KELOMPOK,
  ambilRekapKelompok,
  type JenisKelompok,
} from "@/modules/kependudukan";

export const dynamic = "force-static";
export const revalidate = 60;

type SearchParams = { jenis?: string };

function isJenisKelompok(v: string | undefined): v is JenisKelompok {
  return !!v && (JENIS_KELOMPOK as readonly string[]).includes(v);
}

export default async function AdminKelompokPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const jenis: JenisKelompok = isJenisKelompok(sp.jenis) ? sp.jenis : "pekerjaan";

  const rekap = await ambilRekapKelompok(jenis);

  // Tentukan baris mana yang "tersembunyi" (total == 0 dan persen == 0)
  // untuk dipisahkan ke tabel ringkasan opsional, tapi default kita tampilkan
  // semua agar perangkat desa tahu kategori yang belum terisi.

  const totalSeluruh = rekap.baris.reduce((acc, r) => acc + r.total, 0);

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
          Kelompok Warga
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Pengelompokan warga berdasarkan atribut demografis. Pilih kategori
          di bawah untuk melihat rekap. Setiap baris menaut ke daftar lengkap
          anggota kelompok.
        </p>
      </header>

      {/* === TAB JENIS === */}
      <nav
        aria-label="Kategori kelompok"
        className="flex flex-wrap gap-1 border-b border-ink/15"
      >
        {JENIS_KELOMPOK.map((j) => {
          const aktif = j === jenis;
          return (
            <Link
              key={j}
              href={`/admin/kelompok?jenis=${j}`}
              className={`meta -mb-px border-b-2 px-3 py-2 normal-case tracking-normal transition-colors ${
                aktif
                  ? "border-clay text-ink"
                  : "border-transparent text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
              aria-current={aktif ? "page" : undefined}
            >
              {LABEL_JENIS_KELOMPOK[j]}
            </Link>
          );
        })}
      </nav>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Kategori Aktif</dt>
          <dd className="mt-2 font-serif text-2xl tabular-nums">
            {rekap.label}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Jumlah Kelompok</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {rekap.baris.length.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Warga</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {rekap.totalPenduduk.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Kelompok Terisi</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalSeluruh.toLocaleString("id-ID")}
          </dd>
          <p className="meta text-2xs text-ink-muted">
            akumulasi anggota per kelompok
          </p>
        </div>
      </dl>

      {/* === TABEL === */}
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th scope="col" className="px-3 py-2">
                {rekap.label}
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Total
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Laki-laki
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Perempuan
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                %
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {rekap.baris.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-ink-muted"
                >
                  Belum ada data referensi {rekap.label.toLowerCase()}.
                </td>
              </tr>
            )}
            {rekap.baris.map((row) => {
              const zero = row.total === 0;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-ink/10 ${zero ? "text-ink-muted" : "hover:bg-ink/5"}`}
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
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.persen}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/kelompok/${jenis}/${row.id}`}
                      className={`meta border border-ink/20 bg-paper px-2 py-1 normal-case tracking-normal ${
                        zero
                          ? "pointer-events-none opacity-40"
                          : "hover:border-clay hover:text-clay"
                      }`}
                      aria-disabled={zero}
                      tabIndex={zero ? -1 : undefined}
                    >
                      Lihat Anggota
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <p className="text-ink-muted">
          Klik tab di atas untuk berpindah kategori. Klik &ldquo;Lihat
          Anggota&rdquo; untuk membuka detail satu kelompok.
        </p>
        <Link href="/admin/kependudukan" className="link-clay mt-2 inline-block">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}