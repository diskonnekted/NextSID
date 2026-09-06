import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Props = {
  aktif?: string | null; // slug kategori yang sedang dipilih
  cari?: string | null; // kata kunci pencarian aktif
  kategoriParam?: string | null; // param kategori mentah (untuk dipertahankan saat search)
};

export async function KategoriSidebar({ aktif, cari, kategoriParam }: Props) {
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
      {/* Form pencarian artikel */}
      <form
        method="GET"
        action="/artikel"
        className="flex items-center gap-2 border border-ink/20 bg-paper-dim px-4 py-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5 shrink-0 text-ink-muted"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          name="cari"
          defaultValue={cari ?? ""}
          placeholder="Cari artikel…"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
        {kategoriParam ? (
          <input type="hidden" name="kategori" value={kategoriParam} />
        ) : null}
        <button
          type="submit"
          className="shrink-0 bg-ink px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-paper hover:bg-clay"
        >
          Cari
        </button>
      </form>

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