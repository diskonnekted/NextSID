// Halaman admin — kelola artikel (CRUD).
// Menampilkan daftar artikel dengan aksi Edit / Hapus, dan form modal untuk tambah/edit.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/themes/nusantara/partials/header";
import { Footer } from "@/themes/nusantara/partials/footer";
import DeleteArtikelBtn from "@/components/admin/DeleteArtikelBtn";

export const dynamic = "force-static";
export const revalidate = 60;

type ArtikelRow = {
  id: number;
  judul: string;
  slug: string | null;
  enabled: number;
  headline: number;
  tgl_upload: Date | string | null;
  author: { nama: string } | null;
  kategori: { kategori: string; slug: string | null } | null;
};

async function ambilSemuaArtikel(): Promise<ArtikelRow[]> {
  return prisma.artikel.findMany({
    include: {
      author: { select: { nama: true } },
      kategori: { select: { kategori: true, slug: true } },
    },
    orderBy: { tgl_upload: "desc" },
  });
}

async function ambilSemuaKategori() {
  return prisma.kategori.findMany({
    where: { enabled: 1 },
    orderBy: { kategori: "asc" },
    select: { id: true, kategori: true },
  });
}

async function ambilSemuaPenulis() {
  return prisma.user.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
    take: 100,
  });
}

export default async function AdminArtikelPage() {
  const [artikelList, kategoriList, penulisList] = await Promise.all([
    ambilSemuaArtikel(),
    ambilSemuaKategori(),
    ambilSemuaPenulis(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl">Kelola Artikel</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Kelola berita, pengumuman, dan dokumentasi kegiatan desa.
          </p>
        </div>
        <Link
          href="/admin/artikel/baru"
          className="inline-flex items-center rounded bg-clay px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink"
        >
          Tambah Artikel
        </Link>
      </div>

      {/* Daftar Artikel */}
      {artikelList.length === 0 ? (
        <div className="rounded border border-dashed border-ink/20 bg-paper-dim p-12 text-center">
          <p className="meta">Belum ada artikel</p>
          <p className="mt-3 text-sm text-ink-muted">
            Klik tombol <strong>Tambah Artikel</strong> untuk memulai.
          </p>
          <Link
            href="/admin/artikel/baru"
            className="mt-4 inline-block text-sm text-clay hover:text-ink"
          >
            Tambah artikel pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-wider text-ink-muted">
                <th className="pb-3 pr-4 font-medium">Judul</th>
                <th className="pb-3 pr-4 font-medium">Kategori</th>
                <th className="pb-3 pr-4 font-medium">Penulis</th>
                <th className="pb-3 pr-4 font-medium">Tanggal</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {artikelList.map((a) => (
                <tr key={a.id} className="group">
                  <td className="pr-4 py-3">
                    <Link
                      href={`/admin/artikel/edit/${a.id}`}
                      className="font-serif text-base leading-snug text-ink hover:text-clay"
                    >
                      {a.judul}
                    </Link>
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {a.kategori?.kategori ?? "-"}
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {a.author?.nama ?? "-"}
                  </td>
                  <td className="pr-4 py-3 text-ink-soft">
                    {a.tgl_upload
                      ? new Intl.DateTimeFormat("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(new Date(a.tgl_upload as string))
                      : "-"}
                  </td>
                  <td className="pr-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ${
                        a.enabled === 1
                          ? "bg-success/10 text-success"
                          : "bg-ink/10 text-ink-muted"
                      }`}
                    >
                      {a.enabled === 1 ? "Aktif" : "Draft"}
                    </span>
                    {a.headline === 1 && (
                      <span className="ml-1 inline-block rounded bg-clay/10 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-clay">
                        Headline
                      </span>
                    )}
                  </td>
                  <td className="pr-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link
                        href={`/admin/artikel/edit/${a.id}`}
                        className="text-xs text-clay hover:text-ink"
                      >
                        Edit
                      </Link>
                      <span className="text-ink/20">|</span>
                      <DeleteArtikelBtn id={a.id} />
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
        Total: {artikelList.length} artikel
      </p>
    </div>
  );
}
