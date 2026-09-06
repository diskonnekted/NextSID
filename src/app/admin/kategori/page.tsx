import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteKategoriBtn from "@/components/admin/DeleteKategoriBtn";

export const dynamic = "force-static";
export const revalidate = 60;

type KategoriRow = {
  id: number;
  kategori: string;
  slug: string | null;
  enabled: number;
  urut: number;
  parent: { kategori: string } | null;
  _count: { artikel: number };
};

async function ambilSemuaKategori(): Promise<KategoriRow[]> {
  return prisma.kategori.findMany({
    include: {
      parent: { select: { kategori: true } },
      _count: { select: { artikel: true } },
    },
    orderBy: [{ urut: "asc" }, { id: "asc" }],
  });
}

export default async function AdminKategoriPage() {
  const kategoriList = await ambilSemuaKategori();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Atur kategori artikel untuk portal desa.
          </p>
        </div>
        <Link
          href="/admin/kategori/baru"
          className="inline-flex items-center rounded bg-clay px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink"
        >
          Tambah Kategori
        </Link>
      </div>

      {/* Daftar Kategori */}
      {kategoriList.length === 0 ? (
        <div className="rounded border border-dashed border-ink/20 bg-paper-dim p-12 text-center">
          <p className="meta">Belum ada kategori</p>
          <p className="mt-3 text-sm text-ink-muted">
            Klik tombol <strong>Tambah Kategori</strong> untuk memulai.
          </p>
          <Link
            href="/admin/kategori/baru"
            className="mt-4 inline-block text-sm text-clay hover:text-ink"
          >
            Tambah kategori pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-wider text-ink-muted">
                <th className="pb-3 pr-4 font-medium">Nama</th>
                <th className="pb-3 pr-4 font-medium">Induk</th>
                <th className="pb-3 pr-4 font-medium">Artikel</th>
                <th className="pb-3 pr-4 font-medium">Urut</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {kategoriList.map((k) => (
                <tr key={k.id} className="group">
                  <td className="pr-4 py-3">
                    <Link
                      href={`/admin/kategori/edit/${k.id}`}
                      className="font-serif text-base leading-snug text-ink hover:text-clay"
                    >
                      {k.kategori}
                    </Link>
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {k.parent?.kategori ?? "—"}
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {k._count.artikel}
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {k.urut}
                  </td>
                  <td className="pr-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ${
                        k.enabled === 1
                          ? "bg-success/10 text-success"
                          : "bg-ink/10 text-ink-muted"
                      }`}
                    >
                      {k.enabled === 1 ? "Aktif" : "Draft"}
                    </span>
                  </td>
                  <td className="pr-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        href={`/admin/kategori/edit/${k.id}`}
                        className="text-xs text-clay hover:text-ink"
                      >
                        Edit
                      </Link>
                      <span className="text-ink/20">|</span>
                      <DeleteKategoriBtn id={k.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer info */}
      <p className="meta text-2xs">
        Total: {kategoriList.length} kategori
      </p>
    </div>
  );
}
