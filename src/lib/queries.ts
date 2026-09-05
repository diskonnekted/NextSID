// Data fetching untuk frontpage
import { prisma } from "./prisma";

const ARTIKEL_PER_PAGE = 9;

export async function ambilHeadline() {
  return prisma.artikel.findFirst({
    where: {
      enabled: 1,
      headline: 1,
      tgl_upload: { lte: new Date() },
    },
    include: {
      author: { select: { nama: true } },
      kategori: { select: { kategori: true, slug: true } },
    },
    orderBy: { tgl_upload: "desc" },
  });
}

export async function ambilSlider(limit = 5) {
  // Ambil artikel terbaru yang punya gambar, untuk hero slider
  return prisma.artikel.findMany({
    where: {
      enabled: 1,
      tgl_upload: { lte: new Date() },
      gambar: { not: "" },
      NOT: { gambar: null },
    },
    select: {
      id: true,
      judul: true,
      gambar: true,
      slug: true,
      tgl_upload: true,
    },
    orderBy: { tgl_upload: "desc" },
    take: limit,
  });
}

export async function ambilArtikelPilihan(limit = 3, excludeIds: number[] = []) {
  return prisma.artikel.findMany({
    where: {
      enabled: 1,
      tgl_upload: { lte: new Date() },
      headline: { not: 1 },
      id: { notIn: excludeIds },
    },
    include: {
      author: { select: { nama: true } },
      kategori: { select: { kategori: true, slug: true } },
    },
    orderBy: { tgl_upload: "desc" },
    take: limit,
  });
}

export async function ambilDaftarArtikel(opts: {
  halaman: number;
  perHalaman?: number;
  cari?: string;
  kategoriId?: number;
  excludeIds?: number[];
}) {
  const { halaman, perHalaman = ARTIKEL_PER_PAGE, cari, kategoriId, excludeIds = [] } = opts;
  const skip = (halaman - 1) * perHalaman;

  const where = {
    enabled: 1,
    tgl_upload: { lte: new Date() },
    headline: { not: 1 },
    ...(cari ? { judul: { contains: cari } } : {}),
    ...(kategoriId ? { id_kategori: kategoriId } : {}),
    ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.artikel.findMany({
      where,
      include: {
        author: { select: { nama: true } },
        kategori: { select: { kategori: true, slug: true } },
      },
      orderBy: { tgl_upload: "desc" },
      skip,
      take: perHalaman,
    }),
    prisma.artikel.count({ where }),
  ]);

  return { items, total, perHalaman, halaman };
}

export async function ambilWidgetAktif() {
  return prisma.widget.findMany({
    where: { enabled: 1 },
    orderBy: { urut: "asc" },
  });
}

export async function ambilMediaSosial() {
  return prisma.mediaSosial.findMany({
    where: { enabled: 1 },
  });
}

export async function ambilConfig() {
  // Single-desa untuk MVP: ambil config pertama
  return prisma.config.findFirst({
    orderBy: { id: "asc" },
  });
}
