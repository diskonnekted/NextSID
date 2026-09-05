// Halaman detail Rumah Tangga per RW.
// Menampilkan daftar KK (paginated) untuk satu RW tertentu,
// dengan breakdown per RT sebagai ringkasan.

import Link from "next/link";
import { notFound } from "next/navigation";
import { ambilDaftarKKByRW, ambilRekapRumahTangga } from "@/modules/kependudukan";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { dusun: string; rw: string };
type SearchParams = { halaman?: string; perHalaman?: string };

export default async function AdminKkByRwPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { dusun: rawDusun, rw: rawRw } = await params;
  const sp = await searchParams;
  const dusun = decodeURIComponent(rawDusun);
  const rw = decodeURIComponent(rawRw);

  // Validasi: cek kombinasi dusun+rw ada di DB.
  const cek = await prisma.keluarga.count({ where: { dusun, rw } });
  if (cek === 0) {
    notFound();
  }

  const halaman = Math.max(1, Number(sp.halaman) || 1);
  const perHalaman = Math.min(100, Math.max(5, Number(sp.perHalaman) || 25));

  const [daftar, rekap] = await Promise.all([
    ambilDaftarKKByRW(dusun, rw, halaman, perHalaman),
    ambilRekapRumahTangga(),
  ]);

  // Ringkasan RW ini (dari rekap)
  const ringkasanRW = rekap.perRW.find(
    (r) => r.dusun === dusun && r.rw === rw,
  );

  // Rekap RT di RW ini
  const semuaKk = await prisma.keluarga.findMany({
    where: { dusun, rw },
    select: { rt: true, _count: { select: { anggota: true } } },
  });

  type RingkasanRT = { rt: string; jumlahKK: number; jumlahJiwa: number };
  const rtMap = new Map<string, RingkasanRT>();
  for (const k of semuaKk) {
    const rt = k.rt ?? "0";
    const ex = rtMap.get(rt) ?? {
      rt,
      jumlahKK: 0,
      jumlahJiwa: 0,
    };
    ex.jumlahKK += 1;
    ex.jumlahJiwa += k._count.anggota;
    rtMap.set(rt, ex);
  }
  const perRT: RingkasanRT[] = Array.from(rtMap.values()).sort((a, b) =>
    a.rt.localeCompare(b.rt),
  );

  const totalHalaman = Math.max(1, Math.ceil(daftar.total / perHalaman));
  const nomorAwal = (halaman - 1) * perHalaman + 1;
  const nomorAkhir = Math.min(halaman * perHalaman, daftar.total);

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
        <Link
          href={`/admin/rumah-tangga/${encodeURIComponent(dusun)}`}
          className="hover:text-clay"
        >
          {dusun}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">RW {rw}</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">
          Kependudukan · Rumah Tangga · RW {rw}
        </p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          {dusun} · RW {rw}
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar Kartu Keluarga (KK) di RW {rw}, Dusun {dusun}. Total{" "}
          {ringkasanRW?.jumlahKK.toLocaleString("id-ID") ?? 0} KK dan{" "}
          {ringkasanRW?.jumlahJiwa.toLocaleString("id-ID") ?? 0} jiwa
          terdaftar.
        </p>
      </header>

      {/* === RINGKASAN PER RT === */}
      {perRT.length > 0 && (
        <section aria-labelledby="per-rt-rw">
          <h3 id="per-rt-rw" className="font-serif text-2xl mb-4">
            RT di RW Ini
          </h3>
          <div className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3 lg:grid-cols-4">
            {perRT.map((row) => (
              <div key={row.rt} className="bg-paper px-4 py-4">
                <p className="meta">RT {row.rt}</p>
                <p className="mt-2 font-serif text-2xl tabular-nums">
                  {row.jumlahKK.toLocaleString("id-ID")}{" "}
                  <span className="meta ml-1">KK</span>
                </p>
                <p className="meta mt-1">
                  {row.jumlahJiwa.toLocaleString("id-ID")} jiwa
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === DAFTAR KK === */}
      <section aria-labelledby="daftar-kk-rw">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="daftar-kk-rw" className="font-serif text-2xl">
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
                <th className="px-3 py-2">RT</th>
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
                    Belum ada KK di RW ini.
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
                    {row.rt ?? "—"}
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
        <Link
          href={`/admin/rumah-tangga/${encodeURIComponent(dusun)}`}
          className="link-clay"
        >
          ← Kembali ke Dusun {dusun}
        </Link>
      </aside>
    </div>
  );
}