// Modul Direktori publik — gabungan Lembaga + Layanan + Pamong.
// Dipakai oleh /direktori (grid) dan beranda (mini section).
// Mengikuti pola TownPress: kartu listing + kategori + filter sederhana.

import {
  ambilDaftarLembaga,
  ambilDaftarLayanan,
  ambilDaftarPamong,
} from "@/modules/info-desa";
import type {
  DirektoriItem,
} from "@/components/frontend/DirektoriCard";

// Slug sederhana untuk URL — huruf kecil + strip spasi.
function keSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// Mapping kategori/slug ke gambar di folder /bahan
const GAMBAR_MAP: Record<string, string> = {
  "badan-permusyawaratan-desa": "/bahan/badan-permusyawaratan-desa.PNG",
  "lembaga-pemberdayaan-masyarakat": "/bahan/lembaga-pemberdayaan-masyarakat.PNG",
  "pkk": "/bahan/pkk-desa.PNG",
  "pkk-desa": "/bahan/pkk-desa.PNG",
  "karang-taruna": "/bahan/karang-taruna.PNG",
  "pengaduan": "/bahan/pengaduan.PNG",
};

function cariGambar(judul: string, kategori: string): string | undefined {
  // Coba match berdasarkan slug judul
  const slug = keSlug(judul);
  if (GAMBAR_MAP[slug]) return GAMBAR_MAP[slug];
  // Coba match berdasarkan kategori (case-insensitive)
  const katLower = kategori.toLowerCase();
  if (GAMBAR_MAP[katLower]) return GAMBAR_MAP[katLower];
  // Coba match berdasarkan slug kategori
  const slugKategori = keSlug(kategori);
  if (GAMBAR_MAP[slugKategori]) return GAMBAR_MAP[slugKategori];
  // Coba match berdasarkan substring di slug judul (misal "pkk-desa-cintamulya" match "pkk")
  for (const [key, url] of Object.entries(GAMBAR_MAP)) {
    if (slug.includes(key) || key.includes(slug)) return url;
  }
  // Coba match substring di kategori
  for (const [key, url] of Object.entries(GAMBAR_MAP)) {
    if (katLower.includes(key) || key.includes(katLower)) return url;
  }
  return undefined;
}

export async function ambilDirektori(): Promise<DirektoriItem[]> {
  const [lembaga, layanan, pamong] = await Promise.all([
    ambilDaftarLembaga(),
    ambilDaftarLayanan(),
    ambilDaftarPamong(),
  ]);

  const items: DirektoriItem[] = [];

  for (const l of lembaga) {
    if (l.enabled === 0) continue;
    items.push({
      id: `lembaga-${l.id}`,
      slug: keSlug(l.nama) || `lembaga-${l.id}`,
      jenis: "lembaga",
      judul: l.nama,
      kategori: l.singkatan ?? "Lembaga",
      alamat: l.alamat ?? null,
      kontak: [l.ketua && `Ketua: ${l.ketua}`, l.sekretaris && `Sekretaris: ${l.sekretaris}`]
        .filter(Boolean)
        .join(" · "),
      customIcon: cariGambar(l.nama, l.singkatan ?? ""),
    });
  }

  for (const y of layanan) {
    if (y.enabled === 0) continue;
    items.push({
      id: `layanan-${y.id}`,
      slug: keSlug(y.nama) || `layanan-${y.id}`,
      jenis: "layanan",
      judul: y.nama,
      kategori: y.kategori ?? "Layanan",
      kontak: y.kontak ?? y.url_form ?? null,
      alamat: y.keterangan ?? null,
      customIcon: cariGambar(y.nama, y.kategori ?? ""),
    });
  }

  for (const p of pamong) {
    if (p.pamong_status !== 1) continue;
    items.push({
      id: `pamong-${p.id}`,
      slug: keSlug(p.pamong_nama) || `pamong-${p.id}`,
      jenis: "pamong",
      judul: p.pamong_nama,
      kategori: p.jabatan_nama ?? "Perangkat Desa",
      kontak: [p.gelar_depan, p.pamong_nama, p.gelar_belakang].filter(Boolean).join(" ")
        ? undefined
        : "Perangkat Desa",
      customIcon: p.foto ? `/${p.foto}` : undefined,
    });
  }

  return items;
}

export type DirektoriFilter = "semua" | DirektoriItem["jenis"];

export function filterDirektori(
  items: DirektoriItem[],
  filter: DirektoriFilter,
): DirektoriItem[] {
  if (filter === "semua") return items;
  return items.filter((i) => i.jenis === filter);
}

export type DirektoriKategoriStat = { key: DirektoriFilter; label: string; jumlah: number };

export function hitungKategori(items: DirektoriItem[]): DirektoriKategoriStat[] {
  const k: Array<DirektoriFilter> = ["lembaga", "layanan", "pamong"];
  const labels: Record<DirektoriFilter, string> = {
    semua: "Semua",
    lembaga: "Lembaga",
    layanan: "Layanan",
    pamong: "Perangkat",
  };
  const result: DirektoriKategoriStat[] = [
    { key: "semua", label: labels.semua, jumlah: items.length },
  ];
  for (const key of k) {
    result.push({ key, label: labels[key], jumlah: 0 });
  }
  for (const it of items) {
    const row = result.find((r) => r.key === it.jenis);
    if (row) row.jumlah += 1;
  }
  return result;
}
