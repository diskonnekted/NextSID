import { ambilDaftarArtikel } from "@/lib/queries";
import { ambilThemeAktif } from "@/lib/theme";
import { KategoriSidebar } from "@/components/frontend/KategoriSidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = {
  halaman?: string;
  cari?: string;
  kategori?: string;
};

async function nilaiSetting(key: string, fallback: string | number | boolean) {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  if (typeof fallback === "number") return Number(row.value) || fallback;
  if (typeof fallback === "boolean") return row.value === "1" || row.value === "true";
  return row.value;
}

async function cariKategori(param: string | undefined) {
  if (!param) return { id: undefined as number | undefined, slug: undefined as string | undefined, nama: undefined as string | undefined };
  const numeric = /^\d+$/.test(param) ? parseInt(param, 10) : null;
  const row = await prisma.kategori.findFirst({
    where: {
      enabled: 1,
      OR: [
        { slug: param },
        ...(numeric ? [{ id: numeric }] : []),
      ],
    },
    select: { id: true, kategori: true, slug: true },
  });
  if (!row) return { id: undefined, slug: param, nama: undefined };
  return { id: row.id, slug: row.slug ?? undefined, nama: row.kategori };
}

export default async function DaftarArtikel({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const theme = await ambilThemeAktif();
  const Article = theme.partials.Article;
  const Pagination = theme.partials.Pagination;

  const halaman = Math.max(1, parseInt(searchParams.halaman ?? "1", 10) || 1);
  const cari = searchParams.cari?.trim() || undefined;
  const perHalaman = (await nilaiSetting(
    "jumlah_artikel_perhalaman",
    (theme.konfigurasi ?? []).find((k) => k.key === "jumlah_artikel_perhalaman")?.value as number ?? 9,
  )) as number;

  const kategoriInfo = await cariKategori(searchParams.kategori);
  const kategoriValid = kategoriInfo.id ? kategoriInfo.id : undefined;

  const daftar = await ambilDaftarArtikel({
    halaman,
    perHalaman,
    cari,
    kategoriId: kategoriValid,
  });

  const judulHalaman = cari
    ? `Hasil untuk “${cari}”`
    : kategoriInfo.nama
    ? kategoriInfo.nama
    : "Daftar Artikel";

  const subjudul = cari
    ? `Kumpulan berita, pengumuman, dan dokumentasi kegiatan yang sesuai dengan kata kunci “${cari}”.`
    : kategoriInfo.nama
    ? `Artikel yang dikategorikan sebagai ${kategoriInfo.nama}.`
    : "Kumpulan berita, pengumuman, dan dokumentasi kegiatan terbaru dari pemerintah desa.";

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Sidebar kiri ala TownPress: daftar kategori dengan counter */}
        <div className="lg:col-span-4">
          <KategoriSidebar aktif={kategoriInfo.slug ?? null} />
        </div>

        {/* Konten utama */}
        <div className="min-w-0 lg:col-span-8">
          <header className="border-b border-ink/15 pb-10">
            <p className="meta mb-3">{cari ? "Pencarian" : "Arsip"}</p>
            <h1 className="font-serif text-display-md leading-tight lg:text-display-lg">
              {judulHalaman}
            </h1>
            <p className="mt-4 max-w-prose text-ink-soft">{subjudul}</p>
          </header>

          {daftar.items.length === 0 ? (
            <div className="mt-16 border border-dashed border-ink/20 bg-paper-dim p-12 text-center">
              <p className="meta">Tidak ada hasil</p>
              <p className="mt-3 text-ink-muted">
                Coba kata kunci lain atau kembali ke{" "}
                <a href="/artikel" className="link-clay">arsip lengkap</a>.
              </p>
            </div>
          ) : (
            <>
              <p className="meta mt-10">
                {daftar.total} artikel
                {kategoriInfo.nama ? ` dalam ${kategoriInfo.nama}` : ""}
              </p>
              <div className="mt-8 grid gap-10 sm:grid-cols-2">
                {daftar.items.map((a) => (
                  <Article key={a.id} artikel={a} />
                ))}
              </div>
              <div className="mt-12">
                <Pagination
                  halaman={daftar.halaman}
                  total={daftar.total}
                  perHalaman={daftar.perHalaman}
                  basePath="/artikel"
                  queryParams={{
                    cari,
                    kategori: kategoriInfo.slug ?? (searchParams.kategori || undefined),
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}