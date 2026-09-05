// Halaman Rumah Tangga (RTM).
// Modul OpenSID: tweb_rtm + tweb_penduduk (rtm_level).
//
// Untuk saat ini, RTM direpresentasikan sebagai KK itu sendiri
// (1 KK = 1 Rumah Tangga). Tabel menampilkan rekap per dusun/RW/RT
// dengan total KK dan total jiwa.
//
// Catatan: jika di kemudian hari ada konsep "beberapa KK serumah = 1 RTM",
// modul ini akan diperluas dengan field id_rtm di tabel Penduduk.

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminRumahTanggaPage() {
  // Agregat per dusun
  const perDusun = await prisma.keluarga.groupBy({
    by: ["dusun"],
    _count: { id: true },
    orderBy: { dusun: "asc" },
  });

  // Agregat per dusun + RW
  const perRW = await prisma.keluarga.groupBy({
    by: ["dusun", "rw"],
    _count: { id: true },
    orderBy: [{ dusun: "asc" }, { rw: "asc" }],
  });

  // Total jiwa per KK dihitung dengan agregat
  const semuaKK = await prisma.keluarga.findMany({
    select: {
      no_kk: true,
      dusun: true,
      rw: true,
      rt: true,
      _count: { select: { anggota: true } },
    },
  });

  const jiwaByDusun = new Map<string, number>();
  const jiwaByRW = new Map<string, number>();
  for (const k of semuaKK) {
    const d = k.dusun ?? "Tanpa Dusun";
    const rw = `${k.dusun ?? "-"}|${k.rw ?? "0"}`;
    jiwaByDusun.set(d, (jiwaByDusun.get(d) ?? 0) + k._count.anggota);
    jiwaByRW.set(rw, (jiwaByRW.get(rw) ?? 0) + k._count.anggota);
  }

  // Total agregat
  const totalKK = await prisma.keluarga.count();
  const totalPenduduk = await prisma.penduduk.count();

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
          Rekap Rumah Tangga per dusun dan RW. Rumah Tangga (RTM) pada
          prinsipnya adalah unit yang sama dengan KK — berisi satu keluarga
          inti yang tercatat dalam satu Kartu Keluarga.
        </p>
      </header>

      {/* === RINGKASAN === */}
      <dl className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10">
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
            {totalKK > 0
              ? (totalPenduduk / totalKK).toFixed(1)
              : "0"}
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
              </tr>
            </thead>
            <tbody>
              {perDusun.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada data keluarga.
                  </td>
                </tr>
              )}
              {perDusun.map((row) => {
                const jiwa = jiwaByDusun.get(row.dusun ?? "Tanpa Dusun") ?? 0;
                const kk = row._count.id;
                return (
                  <tr
                    key={row.dusun ?? "Tanpa Dusun"}
                    className="border-t border-ink/10 hover:bg-ink/5"
                  >
                    <td className="px-3 py-2 font-medium">
                      {row.dusun ?? "Tanpa Dusun"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {kk.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {jiwa.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {kk > 0 ? (jiwa / kk).toFixed(1) : "0"}
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
              </tr>
            </thead>
            <tbody>
              {perRW.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-ink-muted"
                  >
                    Belum ada data keluarga.
                  </td>
                </tr>
              )}
              {perRW.map((row, idx) => {
                const key = `${row.dusun ?? "-"}|${row.rw ?? "0"}`;
                const jiwa = jiwaByRW.get(key) ?? 0;
                return (
                  <tr
                    key={`${row.dusun}-${row.rw}-${idx}`}
                    className="border-t border-ink/10 hover:bg-ink/5"
                  >
                    <td className="px-3 py-2">{row.dusun ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums">
                      RW {row.rw ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row._count.id.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {jiwa.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
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