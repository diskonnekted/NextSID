// Ekspor data kependudukan ke Excel.
// Menghasilkan workbook 2 sheet: "Data Penduduk" + "Kode Data"
// dengan urutan kolom & header yang sama dengan format-impor-excel.xlsm
// sehingga file hasil bisa langsung di-import ulang tanpa penyesuaian.

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

// Urutan & header HARUS sama dengan sheetPenduduk di template.ts.
const HEADER_PENDUDUK = [
  "alamat", "dusun", "rw", "rt", "no_kk", "nama", "nik", "sex",
  "tempatlahir", "tanggallahir", "agama_id", "pendidikan_kk_id",
  "pendidikan_sedang_id", "pekerjaan_id", "status_kawin", "kk_level",
  "warganegara_id", "ayah_nik", "nama_ayah", "ibu_nik", "nama_ibu",
  "golongan_darah_id", "akta_lahir", "dokumen_pasport",
  "tanggal_akhir_paspor", "dokumen_kitas", "akta_perkawinan",
  "tanggalperkawinan", "akta_perceraian", "tanggalperceraian",
  "cacat_id", "cara_kb_id", "hamil", "ktp_el", "status_rekam",
  "alamat_sekarang", "status_dasar", "suku", "tag_id_card",
  "id_asuransi", "no_asuransi", "lat", "lng",
];

function isoDate(d: Date | null | undefined): string {
  if (!d) return "";
  // Format YYYY-MM-DD; XLSX akan menulis sebagai string tanggal-safe.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function blank(v: unknown): unknown {
  if (v == null) return "";
  if (v instanceof Date) return isoDate(v);
  return v;
}

export type EksporPendudukArgs = {
  configId?: number;
};

export async function eksporPendudukExcel(
  args: EksporPendudukArgs = {},
): Promise<{ buffer: Buffer; totalPenduduk: number; totalKK: number }> {
  const where: any = {};
  if (args.configId) where.config_id = args.configId;

  const [penduduk, keluarga, kodeAgama, kodePendidikan, kodePekerjaan,
    kodeStatusKawin, kodeHubunganKK, kodeWarganegara, kodeGolonganDarah,
    kodeCacat, kodeCaraKB, kodeStatusDasar, kodeAsuransi] =
    await Promise.all([
      prisma.penduduk.findMany({
        where,
        orderBy: [{ no_kk: "asc" }, { kk_level: "asc" }, { nik: "asc" }],
      }),
      prisma.keluarga.findMany({ where: args.configId ? { config_id: args.configId } : {} }),
      prisma.refAgama.findMany({ orderBy: { id: "asc" } }),
      prisma.refPendidikan.findMany({ orderBy: { id: "asc" } }),
      prisma.refPekerjaan.findMany({ orderBy: { id: "asc" } }),
      prisma.refStatusKawin.findMany({ orderBy: { id: "asc" } }),
      prisma.refHubunganKK.findMany({ orderBy: { id: "asc" } }),
      prisma.refWarganegara.findMany({ orderBy: { id: "asc" } }),
      prisma.refGolonganDarah.findMany({ orderBy: { id: "asc" } }),
      prisma.refCacat.findMany({ orderBy: { id: "asc" } }),
      prisma.refCaraKB.findMany({ orderBy: { id: "asc" } }),
      prisma.refStatusDasar.findMany({ orderBy: { id: "asc" } }),
      prisma.refAsuransi.findMany({ orderBy: { id: "asc" } }),
    ]);

  // Index KK by no_kk untuk lookup cepat
  const kkMap = new Map(keluarga.map((k) => [k.no_kk, k]));

  // Bangun baris penduduk
  const barisPenduduk: unknown[][] = [HEADER_PENDUDUK];
  for (const p of penduduk) {
    const kk = p.no_kk ? kkMap.get(p.no_kk) : null;
    barisPenduduk.push([
      blank(kk?.alamat),
      blank(kk?.dusun),
      blank(kk?.rw),
      blank(kk?.rt),
      blank(p.no_kk),
      blank(p.nama),
      blank(p.nik),
      blank(p.sex),
      blank(p.tempatlahir),
      blank(p.tanggallahir),
      blank(p.agama_id),
      blank(p.pendidikan_kk_id),
      blank(p.pendidikan_sedang_id),
      blank(p.pekerjaan_id),
      blank(p.status_kawin),
      blank(p.kk_level),
      blank(p.warganegara_id),
      blank(p.ayah_nik),
      blank(p.nama_ayah),
      blank(p.ibu_nik),
      blank(p.nama_ibu),
      blank(p.golongan_darah_id),
      blank(p.akta_lahir),
      blank(p.dokumen_pasport),
      blank(p.tanggal_akhir_paspor),
      blank(p.dokumen_kitas),
      blank(p.akta_perkawinan),
      blank(p.tanggalperkawinan),
      blank(p.akta_perceraian),
      blank(p.tanggalperceraian),
      blank(p.cacat_id),
      blank(p.cara_kb_id),
      blank(p.hamil),
      blank(p.ktp_el),
      blank(p.status_rekam),
      blank(p.alamat_sekarang),
      blank(p.status_dasar),
      blank(p.suku),
      blank(p.tag_id_card),
      blank(p.id_asuransi),
      blank(p.no_asuransi),
      blank(p.lat),
      blank(p.lng),
    ]);
  }

  // Bangun baris Kode Data (kategori, id, nama)
  const barisKode: unknown[][] = [["kategori", "id", "nama"]];
  const refSources: Array<{ kategori: string; items: { id: number; nama: string }[] }> = [
    { kategori: "agama", items: kodeAgama },
    { kategori: "pendidikan_kk", items: kodePendidikan },
    { kategori: "pendidikan_sedang", items: kodePendidikan },
    { kategori: "pekerjaan", items: kodePekerjaan },
    { kategori: "status_kawin", items: kodeStatusKawin },
    { kategori: "kk_level", items: kodeHubunganKK },
    { kategori: "warganegara", items: kodeWarganegara },
    { kategori: "golongan_darah", items: kodeGolonganDarah },
    { kategori: "cacat", items: kodeCacat },
    { kategori: "cara_kb", items: kodeCaraKB },
    { kategori: "status_dasar", items: kodeStatusDasar },
    { kategori: "id_asuransi", items: kodeAsuransi },
  ];
  for (const { kategori, items } of refSources) {
    for (const it of items) {
      barisKode.push([kategori, it.id, it.nama]);
    }
  }

  const wb = XLSX.utils.book_new();
  const wsPenduduk = XLSX.utils.aoa_to_sheet(barisPenduduk as (string | number)[][]);
  wsPenduduk["!cols"] = HEADER_PENDUDUK.map((h) => ({
    wch: Math.min(28, Math.max(10, h.length + 2)),
  }));
  XLSX.utils.book_append_sheet(wb, wsPenduduk, "Data Penduduk");

  const wsKode = XLSX.utils.aoa_to_sheet(barisKode as (string | number)[][]);
  wsKode["!cols"] = [{ wch: 22 }, { wch: 6 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsKode, "Kode Data");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return {
    buffer,
    totalPenduduk: penduduk.length,
    totalKK: keluarga.length,
  };
}