// Halaman detail Rumah Tangga per Dusun.
// Menampilkan daftar KK (paginated) untuk satu dusun tertentu,
// dengan breakdown per RW sebagai ringkasan.

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ambilDaftarKKByDusun,
  ambilDaftarDusun,
  ambilRekapRumahTangga,
} from "@/modules/kependudukan";

export const dynamic = "force-dynamic";

type Params = { dusun: string };
type SearchParams = { halaman?: string; perHalaman?: string };

export default async function AdminKkByDusunPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { dusun: rawDusun } = await params;
  const sp = await searchParams;
  const dusun = decodeURIComponent(rawDusun);

  // Validasi dusun ada di DB; kalau tidak ada → 404.
  const semuaDusun = await ambilDaftarDusun();
  if (!semuaDusun.includes(dusun)) {
    notFound();
  }

  const halaman = Math.max(1, Number(sp.halaman) || 1);
  const perHalaman = Math.min(100, Math.max(5, Number(sp.perHalaman) || 25));

  const [daftar, rekap] = await Promise.all([
    ambilDaftarKKByDusun(dusun, halaman, perHalaman),
    ambilRekapRumahTangga(),
  ]);

  // Rekap RW di dusun ini (untuk navigasi ke detail RW).
  const rekapRwDusun = rekap.perRW.filter((r) => r.dusun === dusun);

  const totalHalaman = Math.max(1, Math.ceil(daftar.total / perHalaman));
  const nomorAwal = (halaman - 1) * perHalaman + 1;
  const nomorAkhir = Math.min(halaman * perHalaman, daftar.total);

  // Buat URL paginasi
  const mkHalaman = (h: number) => {
    const usp = new URLSearchParams();
    if (h !== 1) usp.set("halaman", String(h));
    if (perHalaman !== 25) usp.set("perHalaman", String(perHalaman));
    const q = usp.toString();
    return q ? `?${q}` : "";
  };

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
        <Link href="/admin/rumah-tangga" className="hover:text-clay">
          Rumah Tangga
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{dusun}</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · Rumah Tangga · Dusun</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          {dusun}
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar Kartu Keluarga (KK) di Dusun {dusun}.
          Total {daftar.total.toLocaleString("id-ID")} KK terdaftar.
        </p>
      </header>

      {/* === RINGKASAN PER RW (di dusun ini) === */}
      {rekapRwDusun.length > 0 && (
        <section aria-labelledby="per-rw-dusun">
          <h3 id="per-rw-dusun" className="font-serif text-2xl mb-4">
            RW di Dusun Ini
          </h3>
          <div className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {rekapRwDusun.map((row) => (
              <Link
                key={row.rw}
                href={`/admin/rumah-tangga/${encodeURIComponent(dusun)}/${encodeURIComponent(row.rw)}`}
                className="bg-paper px-4 py-4 hover:bg-ink/5"
              >
                <p className="meta">RW {row.rw}</p>
                <p className="mt-2 font-serif text-2xl tabular-nums">
                  {row.jumlahKK.toLocaleString("id-ID")}{" "}
                  <span className="meta ml-1">KK</span>
                </p>
                <p className="meta mt-1">
                  {row.jumlahJiwa.toLocaleString("id-ID")} jiwa
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* === DAFTAR KK === */}
      <section aria-labelledby="daftar-kk">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="daftar-kk" className="font-serif text-2xl">
            Daftar KK
          </h3>
          <p className="meta">
            {daftar.total === 0
              ? "Tidak ada data"
              : `${nomorAwal}–${nomorAkhir} dari ${daftar.total}`}
          </p>
        </div>

        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th className="px-3 py-2">No. KK</th>
                <th className="px-3 py-2">Alamat</th>
                <th className="px-3 py-2">RW / RT</th>
                <th className="px-3 py-2 text-right">Jiwa</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.baris.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada KK di dusun ini.
                  </td>
                </tr>
              )}
              {daftar.baris.map((row) => (
                <tr
                  key={row.no_kk}
                  className="border-t border-ink/10 hover:bg-ink/5"
                >
                  <td className="px-3 py-2 font-mono text-2xs">
                    {row.no_kk}
                  </td>
                  <td className="px-3 py-2 text-ink-muted">
                    {row.alamat ?? "—"}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    RW {row.rw ?? "—"} / RT {row.rt ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.jumlahAnggota.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/admin/kependudukan/kk/${row.no_kk}`}
                      className="link-clay text-2xs"
                    >
                      Lihat →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === PAGINASI === */}
        {totalHalaman > 1 && (
          <nav
            aria-label="Paginasi"
            className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4"
          >
            <p className="meta">
              Halaman {halaman} dari {totalHalaman}
            </p>
            <div className="flex gap-2">
              {halaman > 1 && (
                <Link
                  href={`${mkHalaman(halaman - 1)}`}
                  className="meta border border-ink/20 bg-paper px-3 py-1 normal-case tracking-normal hover:border-ink"
                >
                  ← Sebelumnya
                </Link>
              )}
              {halaman < totalHalaman && (
                <Link
                  href={`${mkHalaman(halaman + 1)}`}
                  className="meta border border-ink bg-ink px-3 py-1 normal-case tracking-normal text-paper hover:bg-clay"
                >
                  Berikutnya →
                </Link>
              )}
            </div>
          </nav>
        )}
      </section>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/rumah-tangga" className="link-clay">
          ← Kembali ke Rumah Tangga
        </Link>
      </aside>
    </div>
  );
}