import { ambilConfig } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Statistik Desa",
  description: "Statistik kependudukan: jenis kelamin, umur, pendidikan, pekerjaan.",
};

// Label bawaan untuk kode yang tidak punya tabel referensi.
// Sesuai catatan OpenSID: sex 1 = Laki-laki, 2 = Perempuan.
const LABEL_STATIK: Record<string, Record<number, string>> = {
  sex: {
    1: "Laki-laki",
    2: "Perempuan",
  },
};

type RekapItem = { key: number | null; total: number };

async function ambilRefMap(tabel: "ref_pendidikan" | "ref_pekerjaan"): Promise<Map<number, string>> {
  const rows = await prisma.$queryRawUnsafe<{ id: number; nama: string }[]>(
    `SELECT id, nama FROM ${tabel}`,
  );
  return new Map(rows.map((r) => [r.id, r.nama]));
}

async function rekapBy(field: "sex" | "pendidikan_kk_id" | "pekerjaan_id"): Promise<RekapItem[]> {
  const rows = await prisma.penduduk.groupBy({
    by: [field],
    where: { status_dasar: 1 },
    _count: { id: true },
  });

  return rows
    .map((r) => {
      const key = (r as unknown as Record<string, number | null>)[field];
      return { key, total: r._count.id };
    })
    .sort((a, b) => b.total - a.total);
}

export default async function DataStatistikPage() {
  const config = await ambilConfig();

  const [total, bySex, byPendidikan, byPekerjaan, refPendidikan, refPekerjaan] = await Promise.all([
    prisma.penduduk.count({ where: { status_dasar: 1 } }),
    rekapBy("sex"),
    rekapBy("pendidikan_kk_id"),
    rekapBy("pekerjaan_id"),
    ambilRefMap("ref_pendidikan"),
    ambilRefMap("ref_pekerjaan"),
  ]);

  // Terjemahan kode ke label deskriptif.
  function label(field: "sex" | "pendidikan_kk_id" | "pekerjaan_id", key: number | null): string {
    if (key === null) return "Tidak tercatat";
    if (LABEL_STATIK[field]?.[key]) return LABEL_STATIK[field][key];
    if (field === "pendidikan_kk_id") return refPendidikan.get(key) ?? `Jenjang ${key}`;
    if (field === "pekerjaan_id") return refPekerjaan.get(key) ?? `Pekerjaan ${key}`;
    return String(key);
  }

  const laki = bySex.find((r) => r.key === 1)?.total ?? 0;
  const perempuan = bySex.find((r) => r.key === 2)?.total ?? 0;

  const rekapList = [
    { id: "jenis-kelamin", field: "sex" as const, judul: "Jenis Kelamin", items: bySex },
    { id: "pendidikan", field: "pendidikan_kk_id" as const, judul: "Pendidikan", items: byPendidikan },
    { id: "pekerjaan", field: "pekerjaan_id" as const, judul: "Pekerjaan", items: byPekerjaan },
  ];

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="mb-12 border-b border-ink/15 pb-8">
        <p className="meta mb-3">Statistik</p>
        <h1 className="font-serif text-display-md leading-tight">
          Data Statistik {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-4 max-w-prose text-ink-muted">
          Ringkasan data kependudukan berdasarkan jenis kelamin, umur,
          pendidikan, dan pekerjaan warga desa.
        </p>
      </header>

      <section id="penduduk" className="mb-12 grid gap-4 sm:grid-cols-3">
        <div className="border border-ink/15 bg-paper p-6">
          <p className="meta">Total Penduduk</p>
          <p className="mt-2 font-serif text-display-sm">{total}</p>
          <p className="mt-1 text-xs text-ink-muted">Status dasar: Hidup</p>
        </div>
        <div className="border border-ink/15 bg-paper p-6">
          <p className="meta">Laki-laki</p>
          <p className="mt-2 font-serif text-display-sm">{laki}</p>
        </div>
        <div className="border border-ink/15 bg-paper p-6">
          <p className="meta">Perempuan</p>
          <p className="mt-2 font-serif text-display-sm">{perempuan}</p>
        </div>
      </section>

      <div className="space-y-12">
        {rekapList.map((r) => (
          <section key={r.id} id={r.id} className="border-t border-ink/15 pt-8">
            <h2 className="font-serif text-headline mb-6">{r.judul}</h2>
            {r.items.length === 0 ? (
              <p className="text-sm text-ink-muted">Belum ada data.</p>
            ) : (
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                {r.items.map((it, i) => {
                  const persen = total > 0 ? (it.total / total) * 100 : 0;
                  return (
                    <li
                      key={`${r.id}-${i}`}
                      className="grid grid-cols-12 items-center gap-3 py-3 text-sm"
                    >
                      <span className="col-span-5 sm:col-span-6">{label(r.field, it.key)}</span>
                      <span className="col-span-3 text-right tabular-nums">{it.total}</span>
                      <span className="col-span-4 sm:col-span-3 text-right text-xs text-ink-muted tabular-nums">
                        {persen.toFixed(1)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}

        <section id="umur" className="border-t border-ink/15 pt-8">
          <h2 className="font-serif text-headline mb-4">Umur</h2>
          <p className="text-sm text-ink-muted">
            Distribusi umur akan ditampilkan di sini dalam bentuk piramida
            penduduk.
          </p>
          <div className="mt-4 border border-dashed border-ink/20 p-6 text-center text-xs text-ink-muted">
            Placeholder grafik umur
          </div>
        </section>
      </div>
    </div>
  );
}