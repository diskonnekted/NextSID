// Halaman Kartu Keluarga — daftar ringkas + tautan ke detail.
// Setiap baris menampilkan No. KK, alamat, Dusun/RW/RT, kepala keluarga,
// dan jumlah anggota. Pencarian sederhana di atas tabel.

import Link from "next/link";
import { ambilDaftarKK } from "@/modules/kependudukan";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminKKPage({
  searchParams,
}: {
  searchParams: Promise<{ halaman?: string; perHalaman?: string; cari?: string }>;
}) {
  const sp = await searchParams;
  const halaman = Math.max(1, parseInt(sp.halaman ?? "1", 10) || 1);
  const perHalaman = Math.min(100, Math.max(5, parseInt(sp.perHalaman ?? "20", 10) || 20));
  const cari = sp.cari?.trim() || undefined;

  const { baris, total, halaman: hal, totalHalaman } = await ambilDaftarKK({
    halaman,
    perHalaman,
    cari,
  });

  // Pagination link base
  function buatLinkHalaman(h: number): string {
    const params = new URLSearchParams();
    if (cari) params.set("cari", cari);
    params.set("halaman", String(h));
    params.set("perHalaman", String(perHalaman));
    return `/admin/kk?${params.toString()}`;
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
        <span className="text-ink">Kartu Keluarga</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="meta mb-2">Kependudukan · KK</p>
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              Kartu Keluarga
            </h2>
            <p className="mt-3 max-w-2xl text-ink-muted">
              Daftar Kartu Keluarga yang sudah tercatat. Klik nomor untuk membuka
              detail dan daftar anggota.
            </p>
          </div>
          <Link
            href="/admin/kk/baru"
            className="meta inline-flex items-center gap-2 self-start border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay"
          >
            <span aria-hidden="true">+</span>
            Tambah KK
          </Link>
        </div>
      </header>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10">
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total KK</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {total.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Halaman</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {hal.toLocaleString("id-ID")} / {totalHalaman.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Per Halaman</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {perHalaman.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>

      {/* === PENCARIAN === */}
      <form
        method="get"
        action="/admin/kk"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor="cari-kk" className="meta">
          Cari
        </label>
        <div className="flex w-full gap-2">
          <input
            id="cari-kk"
            name="cari"
            type="search"
            defaultValue={cari ?? ""}
            placeholder="Nomor KK, alamat, dusun, atau nama kepala"
            className="flex-1 border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <input type="hidden" name="perHalaman" value={perHalaman} />
          <button
            type="submit"
            className="meta border border-ink/40 bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay"
          >
            Cari
          </button>
        </div>
      </form>

      {/* === TABEL === */}
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">No. KK</th>
              <th className="px-3 py-2">Kepala</th>
              <th className="px-3 py-2">Alamat</th>
              <th className="px-3 py-2">Dusun / RW / RT</th>
              <th className="px-3 py-2 text-right">Anggota</th>
            </tr>
          </thead>
          <tbody>
            {baris.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-ink-muted"
                >
                  {cari
                    ? `Tidak ada KK yang cocok dengan pencarian "${cari}".`
                    : "Belum ada data Kartu Keluarga."}
                </td>
              </tr>
            )}
            {baris.map((k) => (
              <tr
                key={k.no_kk}
                className="border-t border-ink/10 hover:bg-ink/5"
              >
                <td className="px-3 py-2 font-medium tabular-nums">
                  <Link
                    href={`/admin/kependudukan/kk/${k.no_kk}`}
                    className="link-clay"
                  >
                    {k.no_kk}
                  </Link>
                </td>
                <td className="px-3 py-2">{k.kepalaKeluarga ?? "—"}</td>
                <td className="px-3 py-2 text-ink-muted">
                  {k.alamat ?? "—"}
                </td>
                <td className="px-3 py-2 text-ink-muted">
                  {[
                    k.dusun,
                    k.rw && `RW ${k.rw}`,
                    k.rt && `RT ${k.rt}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {k.jumlahAnggota.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === PAGINASI === */}
      <nav className="flex items-center justify-between text-sm">
        <p className="meta">
          Halaman {hal.toLocaleString("id-ID")} dari{" "}
          {totalHalaman.toLocaleString("id-ID")} ·{" "}
          {total.toLocaleString("id-ID")} KK
        </p>
        <div className="flex gap-2">
          {hal > 1 && (
            <Link
              href={buatLinkHalaman(hal - 1)}
              className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
            >
              Sebelumnya
            </Link>
          )}
          {hal < totalHalaman && (
            <Link
              href={buatLinkHalaman(hal + 1)}
              className="meta border border-ink/20 px-3 py-1.5 normal-case tracking-normal hover:border-ink"
            >
              Berikutnya
            </Link>
          )}
        </div>
      </nav>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kependudukan" className="link-clay">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}