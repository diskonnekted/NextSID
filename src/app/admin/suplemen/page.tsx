// Halaman Data Suplemen.
// Modul OpenSID: suplemen + terdata_suplemen.
//
// Untuk saat ini, "data suplemen" didekati dengan rekap data
// demografi penduduk berdasarkan variabel:
//   - Agama
//   - Pendidikan
//   - Status Kawin
//   - Golongan Darah
// Tiap baris menampilkan jumlah warga untuk kategori tersebut.
//
// Catatan: jika di kemudian hari ada tabel suplemen khusus dengan
// variabel terdata (mis. PKH, stunting), modul ini akan diperluas.

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";
export const revalidate = 60;

async function rekapByRef(
  model: "refAgama" | "refPendidikan" | "refStatusKawin" | "refGolonganDarah",
  fieldPenduduk: "agama_id" | "pendidikan_kk_id" | "status_kawin" | "golongan_darah_id",
) {
  const refs = await (prisma[model] as any).findMany({ orderBy: { nama: "asc" } });
  const result = await Promise.all(
    refs.map(async (r: any) => ({
      id: r.id,
      nama: r.nama,
      total: await prisma.penduduk.count({
        where: { [fieldPenduduk]: r.id } as any,
      }),
    })),
  );
  return result;
}

export default async function AdminSuplemenPage() {
  const [agama, pendidikan, statusKawin, golonganDarah] = await Promise.all([
    rekapByRef("refAgama", "agama_id"),
    rekapByRef("refPendidikan", "pendidikan_kk_id"),
    rekapByRef("refStatusKawin", "status_kawin"),
    rekapByRef("refGolonganDarah", "golongan_darah_id"),
  ]);

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
        <span className="text-ink">Data Suplemen</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · Suplemen</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Data Suplemen
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Variabel tambahan demografi untuk sasaran program (PKH, stunting,
          UMKM, dll.). Tiap bagian menampilkan rekap warga untuk satu
          variabel suplemen.
        </p>
      </header>

      <Section title="Agama" rows={agama} />
      <Section title="Pendidikan (KK)" rows={pendidikan} />
      <Section title="Status Kawin" rows={statusKawin} />
      <Section title="Golongan Darah" rows={golonganDarah} />

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <p className="text-ink-muted">
          Catatan: saat ini data suplemen dibaca langsung dari tabel
          penduduk. Modul penuh (variabel kustom + sasaran program)
          menyusul.
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

function Section({
  title,
  rows,
}: {
  title: string;
  rows: { id: number; nama: string; total: number }[];
}) {
  const total = rows.reduce((acc, r) => acc + r.total, 0);
  return (
    <section>
      <h3 className="font-serif text-2xl mb-4">{title}</h3>
      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2 text-right">Jumlah</th>
              <th className="px-3 py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-6 text-center text-ink-muted"
                >
                  Belum ada data.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const persen =
                total > 0 ? ((r.total / total) * 100).toFixed(1) : "0";
              return (
                <tr
                  key={r.id}
                  className="border-t border-ink/10 hover:bg-ink/5"
                >
                  <td className="px-3 py-2">{r.nama}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-ink-muted">
                    {persen}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-ink/15 bg-ink/5">
                <td className="px-3 py-2 font-medium">Total</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  {total.toLocaleString("id-ID")}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-muted">
                  100%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}