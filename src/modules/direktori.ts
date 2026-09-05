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
