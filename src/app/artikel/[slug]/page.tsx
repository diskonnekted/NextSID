import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { tanggalIndonesia, waktuBaca } from "@/lib/settings";
import { ambilConfig } from "@/lib/queries";
import { ArticleCard } from "@/components/frontend/ArticleCard";

export const dynamic = "force-dynamic";

async function ambilArtikel(slugOrId: string) {
  const numericId = /^\d+$/.test(slugOrId) ? parseInt(slugOrId, 10) : null;
  return prisma.artikel.findFirst({
    where: {
      enabled: 1,
      OR: [
        { slug: slugOrId },
        ...(numericId ? [{ id: numericId }] : []),
      ],
    },
    include: {
      author: { select: { nama: true } },
      kategori: { select: { kategori: true, slug: true } },
    },
  });
}

async function ambilArtikelSerupa(artikelId: number, kategoriId: number | null | undefined, limit = 4) {
  return prisma.artikel.findMany({
    where: {
      enabled: 1,
      id: { not: artikelId },
      tgl_upload: { lte: new Date() },
      ...(kategoriId ? { id_kategori: kategoriId } : {}),
    },
    select: {
      id: true,
      judul: true,
      isi: true,
      slug: true,
      gambar: true,
      tgl_upload: true,
      kategori: { select: { kategori: true, slug: true } },
    },
    orderBy: { tgl_upload: "desc" },
    take: limit,
  });
}

async function ambilKategoriAktif() {
  return prisma.kategori.findMany({
    where: { enabled: 1, parent_id: null },
    orderBy: { urut: "asc" },
    select: {
      id: true,
      kategori: true,
      slug: true,
      _count: { select: { artikel: { where: { enabled: 1 } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const artikel = await ambilArtikel(params.slug);
  if (!artikel) return { title: "Artikel tidak ditemukan" };
  return {
    title: artikel.judul,
    description: artikel.isi.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function HalamanArtikel({
  params,
}: {
  params: { slug: string };
}) {
  const [artikel, config] = await Promise.all([
    ambilArtikel(params.slug),
    ambilConfig(),
  ]);

  if (!artikel) notFound();

  // Hit counter (best-effort)
  await prisma.artikel.update({
    where: { id: artikel.id },
    data: { hit: { increment: 1 } },
  });

  const [serupa, semuaKategori] = await Promise.all([
    ambilArtikelSerupa(artikel.id, artikel.id_kategori, 4),
    ambilKategoriAktif(),
  ]);

  const url = typeof window === "undefined" ? "" : window.location.href;
  const shareUrl = url || `/artikel/${artikel.slug ?? artikel.id}`;
  const encoded = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(artikel.judul);

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Konten utama */}
        <article className="min-w-0 lg:col-span-8">
          <nav aria-label="Navigasi butir" className="mb-8 text-sm">
            <Link href="/" className="link-clay">Beranda</Link>
            <span aria-hidden> · </span>
            <Link href="/artikel" className="link-clay">Artikel</Link>
            {artikel.kategori ? (
              <>
                <span aria-hidden> · </span>
                <Link
                  href={`/artikel?kategori=${artikel.kategori.slug ?? artikel.kategori.kategori}`}
                  className="link-clay"
                >
                  {artikel.kategori.kategori}
                </Link>
              </>
            ) : null}
          </nav>

          <header>
            {artikel.kategori ? (
              <p className="meta mb-4">{artikel.kategori.kategori}</p>
            ) : null}
            <h1 className="font-serif text-display-md leading-[1.1] lg:text-display-lg">
              {artikel.judul}
            </h1>
            <p className="meta mt-6">
              <span>{tanggalIndonesia(artikel.tgl_upload)}</span>
              {artikel.author?.nama ? (
                <>
                  <span aria-hidden> · </span>
                  <span>oleh {artikel.author.nama}</span>
                </>
              ) : null}
              <span aria-hidden> · </span>
              <span>{waktuBaca(artikel.isi)} menit baca</span>
              <span aria-hidden> · </span>
              <span>{artikel.hit + 1} kali dibaca</span>
            </p>
          </header>

          {artikel.gambar ? (
            <figure className="mt-10">
              <div className="relative aspect-[16/9] overflow-hidden bg-ink/5">
                <Image
                  src={artikel.gambar}
                  alt={artikel.judul}
                  fill
                  priority
                  sizes="(min-width: 1024px) 768px, 100vw"
                  className="object-cover"
                />
              </div>
            </figure>
          ) : null}

          <div
            className="prose mx-auto mt-12 max-w-prose text-lg leading-relaxed text-ink"
            dangerouslySetInnerHTML={{ __html: artikel.isi }}
          />

          <footer className="mt-16 border-t border-ink/15 pt-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="meta">
                Diterbitkan oleh {config?.nama_desa ?? "Pemerintah Desa"}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-clay"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-clay"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-clay"
                >
                  X / Twitter
                </a>
              </div>
            </div>
          </footer>
        </article>

        {/* Sidebar kanan ala TownPress: kategori + artikel terkait */}
        <aside className="min-w-0 space-y-12 lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
          <section aria-labelledby="kategori-detail-heading">
            <h2 id="kategori-detail-heading" className="meta mb-4">Kategori</h2>
            <ul className="space-y-1 border-t border-ink/15">
              {semuaKategori.map((k) => {
                const isActive = artikel.kategori?.slug === k.slug;
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
          </section>

          {serupa.length > 0 ? (
            <section aria-labelledby="serupa-heading">
              <div className="mb-4 flex items-baseline justify-between border-b border-ink/15 pb-2">
                <h2 id="serupa-heading" className="meta">Artikel Terkait</h2>
                <Link href="/artikel" className="text-xs text-clay hover:text-ink">
                  Arsip →
                </Link>
              </div>
              <div>
                {serupa.map((a) => (
                  <ArticleCard key={a.id} artikel={a} varian="compact" />
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-sm border border-ink/15 bg-paper-dim p-5">
            <h3 className="meta mb-2">Berlangganan</h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Dapatkan informasi terbaru dari pemerintah desa langsung ke kotak masuk.
            </p>
            <Link href="/artikel" className="mt-4 inline-block link-clay">
              Lihat semua artikel →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}