// Halaman Rumah Tangga (RTM).
// Modul OpenSID: tweb_rtm + tweb_penduduk (rtm_level).
//
// Untuk saat ini, RTM direpresentasikan sebagai KK itu sendiri
// (1 KK = 1 Rumah Tangga). Tabel menampilkan rekap per dusun/RW/RT
// dengan total KK dan total jiwa, lengkap dengan link drill-down ke
// daftar KK di setiap dusun/RW/RT.
//
// Catatan: jika di kemudian hari ada konsep "beberapa KK serumah = 1 RTM",
// modul ini akan diperluas dengan field id_rtm di tabel Penduduk.

import Link from "next/link";
import { ambilRekapRumahTangga } from "@/modules/kependudukan";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminRumahTanggaPage() {
  const rekap = await ambilRekapRumahTangga();

  // Total agregat
  const [totalKK, totalPenduduk] = await Promise.all([
    prisma.keluarga.count(),
    prisma.penduduk.count(),
  ]);

  // Rekap per RT (paling granular). Sumber: query agregat langsung.
  const semuaKK = await prisma.keluarga.findMany({
    select: {
      no_kk: true,
      dusun: true,
      rw: true,
      rt: true,
      _count: { select: { anggota: true } },
    },
  });

  type RT = { dusun: string; rw: string; rt: string; jumlahKK: number; jumlahJiwa: number };
  const rtMap = new Map<string, RT>();
  for (const k of semuaKK) {
    const key = `${k.dusun ?? "-"}|${k.rw ?? "0"}|${k.rt ?? "0"}`;
    const existing = rtMap.get(key) ?? {
      dusun: k.dusun ?? "(Tanpa Dusun)",
      rw: k.rw ?? "0",
      rt: k.rt ?? "0",
      jumlahKK: 0,
      jumlahJiwa: 0,
    };
    existing.jumlahKK += 1;
    existing.jumlahJiwa += k._count.anggota;
    rtMap.set(key, existing);
  }
  const perRT: RT[] = Array.from(rtMap.values()).sort((a, b) => {
    if (a.dusun !== b.dusun) return a.dusun.localeCompare(b.dusun);
    if (a.rw !== b.rw) return a.rw.localeCompare(b.rw);
    return a.rt.localeCompare(b.rt);
  });

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
        <span className="text-ink">Rumah Tangga</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · Rumah Tangga</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Rumah Tangga
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Rekap Rumah Tangga per dusun, RW, dan RT. Rumah Tangga (RTM)
          pada prinsipnya adalah unit yang sama dengan KK — berisi satu
          keluarga inti yang tercatat dalam satu Kartu Keluarga. Klik
          baris untuk melihat daftar KK.
        </p>
      </header>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 sm:grid-cols-4">
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Rumah Tangga</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalKK.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Total Jiwa</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalPenduduk.toLocaleString("id-ID")}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Rata-rata / KK</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {totalKK > 0 ? (totalPenduduk / totalKK).toFixed(1) : "0"}
          </dd>
        </div>
        <div className="bg-paper px-4 py-5">
          <dt className="meta">Jumlah Dusun</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums">
            {rekap.perDusun.length.toLocaleString("id-ID")}
          </dd>
        </div>
      </dl>

      {/* === REKAP PER DUSUN === */}
      <section aria-labelledby="per-dusun">
        <h3 id="per-dusun" className="font-serif text-2xl mb-4">
          Rekap per Dusun
        </h3>
        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th className="px-3 py-2">Dusun</th>
                <th className="px-3 py-2 text-right">KK</th>
                <th className="px-3 py-2 text-right">Jiwa</th>
                <th className="px-3 py-2 text-right">Rata-rata</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rekap.perDusun.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada data keluarga.
                  </td>
                </tr>
              )}
              {rekap.perDusun.map((row) => {
                const dusun = row.dusun ?? "(Tanpa Dusun)";
                return (
                  <tr
                    key={dusun}
                    className="border-t border-ink/10 hover:bg-ink/5"
                  >
                    <td className="px-3 py-2 font-medium">{dusun}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.jumlahKK.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.jumlahJiwa.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.jumlahKK > 0
                        ? (row.jumlahJiwa / row.jumlahKK).toFixed(1)
                        : "0"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/rumah-tangga/${encodeURIComponent(dusun)}`}
                        className="link-clay text-2xs"
                      >
                        Lihat KK →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* === REKAP PER RW === */}
      <section aria-labelledby="per-rw">
        <h3 id="per-rw" className="font-serif text-2xl mb-4">
          Rekap per RW
        </h3>
        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th className="px-3 py-2">Dusun</th>
                <th className="px-3 py-2">RW</th>
                <th className="px-3 py-2 text-right">KK</th>
                <th className="px-3 py-2 text-right">Jiwa</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rekap.perRW.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada data keluarga.
                  </td>
                </tr>
              )}
              {rekap.perRW.map((row) => {
                const dusun = row.dusun;
                const rw = row.rw;
                return (
                  <tr
                    key={`${dusun}-${rw}`}
                    className="border-t border-ink/10 hover:bg-ink/5"
                  >
                    <td className="px-3 py-2">{dusun}</td>
                    <td className="px-3 py-2 tabular-nums">RW {rw}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.jumlahKK.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.jumlahJiwa.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/admin/rumah-tangga/${encodeURIComponent(dusun)}/${encodeURIComponent(rw)}`}
                        className="link-clay text-2xs"
                      >
                        Lihat KK →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* === REKAP PER RT (granular) === */}
      <section aria-labelledby="per-rt">
        <h3 id="per-rt" className="font-serif text-2xl mb-4">
          Rekap per RT
        </h3>
        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th className="px-3 py-2">Dusun</th>
                <th className="px-3 py-2">RW</th>
                <th className="px-3 py-2">RT</th>
                <th className="px-3 py-2 text-right">KK</th>
                <th className="px-3 py-2 text-right">Jiwa</th>
              </tr>
            </thead>
            <tbody>
              {perRT.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada data keluarga.
                  </td>
                </tr>
              )}
              {perRT.map((row) => (
                <tr
                  key={`${row.dusun}-${row.rw}-${row.rt}`}
                  className="border-t border-ink/10 hover:bg-ink/5"
                >
                  <td className="px-3 py-2">{row.dusun}</td>
                  <td className="px-3 py-2 tabular-nums">RW {row.rw}</td>
                  <td className="px-3 py-2 tabular-nums">RT {row.rt}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.jumlahKK.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.jumlahJiwa.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kependudukan" className="link-clay">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}