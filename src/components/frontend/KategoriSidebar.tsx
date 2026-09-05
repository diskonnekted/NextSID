import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = {
  aktif?: string | null; // slug kategori yang sedang dipilih
};

export async function KategoriSidebar({ aktif }: Props) {
  const kategori = await prisma.kategori.findMany({
    where: { enabled: 1, parent_id: null },
    orderBy: { urut: "asc" },
    select: {
      id: true,
      kategori: true,
      slug: true,
      _count: { select: { artikel: { where: { enabled: 1 } } } },
    },
  });

  const totalSemua = await prisma.artikel.count({ where: { enabled: 1 } });

  return (
    <aside aria-label="Kategori artikel" className="space-y-8 lg:sticky lg:top-8 lg:self-start">
      <div>
        <h2 className="meta mb-4">Kategori</h2>
        <ul className="space-y-1 border-t border-ink/15">
          <li>
            <Link
              href="/artikel"
              className={`flex items-baseline justify-between border-b border-ink/10 py-3 text-sm transition hover:text-clay ${
                !aktif ? "font-serif text-base text-clay" : "text-ink"
              }`}
            >
              <span>Semua</span>
              <span className="meta">{totalSemua}</span>
            </Link>
          </li>
          {kategori.map((k) => {
            const isActive = aktif === (k.slug ?? `id-${k.id}`);
            const href = `/artikel?kategori=${encodeURIComponent(k.slug ?? k.id.toString())}`;
            return (
              <li key={k.id}>
                <Link
                  href={href}
                  className={`flex items-baseline justify-between border-b border-ink/10 py-3 text-sm transition hover:text-clay ${
                    isActive ? "font-serif text-base text-clay" : "text-ink"
                  }`}
                >
                  <span>{k.kategori}</span>
                  <span className="meta">{k._count.artikel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-sm border border-ink/15 bg-paper-dim p-5">
        <h3 className="meta mb-2">Arsip Desa</h3>
        <p className="text-sm leading-relaxed text-ink-soft">
          Kumpulan berita, pengumuman, dan dokumentasi kegiatan pemerintah desa yang dipublikasikan untuk warga.
        </p>
      </div>
    </aside>
  );
}