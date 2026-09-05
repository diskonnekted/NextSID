// Handler import khusus kependudukan.
// Memproses sheet: kode_data → keluarga → penduduk.
//
// Aturan:
//   - kode_data dipetakan ke 11 tabel Ref*. Kolom `kategori` di Excel
//     menentukan tabel Ref* tujuan (agama, pendidikan_kk, dll).
//   - keluarga di-upsert by no_kk.
//   - penduduk di-upsert by nik. Field no_kk harus sudah ada di tabel
//     keluarga; kalau tidak ada, penduduk tetap diinsert dengan
//     relasi null (tidak error). Ayah/ibu bersifat self-reference ke
//     Penduduk; bila NIK belum ada di DB, field tetap disimpan null.
//
// Kontrak format: 43 kolom format-impor-excel.xlsm sheet "Data
// Penduduk" + sheet "Kode Data".

import { prisma } from "@/lib/prisma";
import { BarisImport, HasilParse } from "../importer/parser";

export type ImporterResult = {
  sheetKey: string;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};

// ----- helpers ----------------------------------------------------------

function asString(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v).trim();
}

function asInt(v: unknown, fallback: number | null = null): number | null {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown): number {
  if (v === 1 || v === true || v === "1" || v === "true") return 1;
  return 0;
}

function asDate(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") {
    // Excel serial date
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  const s = String(v).trim();
  // Excel serial date as string
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    const d = new Date(Math.round((n - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d;
  }
  // ISO / YYYY-MM-DD / YYYY-MM-DD HH:mm:ss
  const coba1 = new Date(s);
  if (!isNaN(coba1.getTime())) return coba1;
  const coba2 = new Date(s.replace(" ", "T"));
  return isNaN(coba2.getTime()) ? null : coba2;
}

// Mapping kategori → tabel Ref* di Prisma.
const REF_TABLES: Record<
  string,
  { findFirst: (args: any) => Promise<any>; upsert: (args: any) => Promise<any> }
> = {} as any;

function ambilRefTable(kategori: string): {
  model: { upsert: (args: any) => Promise<unknown> };
  field: string;
} | null {
  switch (kategori) {
    case "agama":
      return { model: prisma.refAgama, field: "id" };
    case "pendidikan_kk":
    case "pendidikan":
      return { model: prisma.refPendidikan, field: "id" };
    case "pekerjaan":
      return { model: prisma.refPekerjaan, field: "id" };
    case "status_kawin":
      return { model: prisma.refStatusKawin, field: "id" };
    case "kk_level":
    case "hubungan_kk":
      return { model: prisma.refHubunganKK, field: "id" };
    case "warganegara":
      return { model: prisma.refWarganegara, field: "id" };
    case "golongan_darah":
      return { model: prisma.refGolonganDarah, field: "id" };
    case "cacat":
      return { model: prisma.refCacat, field: "id" };
    case "cara_kb":
      return { model: prisma.refCaraKB, field: "id" };
    case "status_dasar":
      return { model: prisma.refStatusDasar, field: "id" };
    case "asuransi":
    case "id_asuransi":
      return { model: prisma.refAsuransi, field: "id" };
    default:
      return null;
  }
}

// ----- handler: kode_data ----------------------------------------------

async function handleKodeData(
  baris: BarisImport[],
): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "kode_data",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of baris) {
    const kategori = asString(row.kategori).toLowerCase();
    const id = asInt(row.id, null);
    const nama = asString(row.nama);
    if (!kategori || id == null || !nama) {
      result.skipped++;
      continue;
    }
    const ref = ambilRefTable(kategori);
    if (!ref) {
      result.skipped++;
      continue;
    }
    try {
      await ref.model.upsert({
        where: { id },
        update: { nama },
        create: { id, nama },
      });
      result.updated++;
    } catch (e) {
      result.errors.push(`[${kategori}/${id}] ${e}`);
    }
  }
  return result;
}

// ----- handler: keluarga ------------------------------------------------

async function handleKeluarga(
  baris: BarisImport[],
): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "keluarga",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id ?? null;

  for (const row of baris) {
    const no_kk = asString(row.no_kk);
    if (!no_kk) {
      result.skipped++;
      continue;
    }
    try {
      const data = {
        config_id: configId,
        alamat: asString(row.alamat) || null,
        dusun: asString(row.dusun) || null,
        rw: asString(row.rw) || null,
        rt: asString(row.rt) || null,
      };
      const existing = await prisma.keluarga.findUnique({
        where: { no_kk },
      });
      if (existing) {
        await prisma.keluarga.update({ where: { no_kk }, data });
        result.updated++;
      } else {
        await prisma.keluarga.create({ data: { no_kk, ...data } });
        result.inserted++;
      }
    } catch (e) {
      result.errors.push(`[kk ${no_kk}] ${e}`);
    }
  }
  return result;
}

// ----- handler: penduduk -----------------------------------------------

async function handlePenduduk(
  baris: BarisImport[],
): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "penduduk",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id ?? null;

  // Cache keluarga untuk validasi cepat + auto-create
  const kkCache = new Set<string>();
  const allKk = await prisma.keluarga.findMany({ select: { no_kk: true } });
  for (const k of allKk) if (k.no_kk) kkCache.add(k.no_kk);

  // Kumpulkan KK yang belum ada, lalu upsert sekaligus.
  const kkToCreate = new Map<string, { alamat: string | null; dusun: string | null; rw: string | null; rt: string | null }>();
  for (const row of baris) {
    const no_kk = asString(row.no_kk);
    if (!no_kk || kkCache.has(no_kk) || kkToCreate.has(no_kk)) continue;
    kkToCreate.set(no_kk, {
      alamat: asString(row.alamat) || null,
      dusun: asString(row.dusun) || null,
      rw: asString(row.rw) || null,
      rt: asString(row.rt) || null,
    });
  }
  for (const [no_kk, data] of kkToCreate) {
    try {
      await prisma.keluarga.create({
        data: { no_kk, ...data, config_id: configId },
      });
      kkCache.add(no_kk);
    } catch (e) {
      // Unique conflict = sudah dibuat (race); skip.
    }
  }

  for (const row of baris) {
    const nik = asString(row.nik);
    if (!nik || !row.nama) {
      result.skipped++;
      continue;
    }
    try {
      const no_kk = asString(row.no_kk) || null;
      const data = {
        config_id: configId,
        no_kk: no_kk && kkCache.has(no_kk) ? no_kk : null,
        nama: asString(row.nama),
        sex: asInt(row.sex, null),
        tempatlahir: asString(row.tempatlahir) || null,
        tanggallahir: asDate(row.tanggallahir),
        agama_id: asInt(row.agama_id, null),
        pendidikan_kk_id: asInt(row.pendidikan_kk_id, null),
        pendidikan_sedang_id: asInt(row.pendidikan_sedang_id, null),
        pekerjaan_id: asInt(row.pekerjaan_id, null),
        status_kawin: asInt(row.status_kawin, null),
        kk_level: asInt(row.kk_level, null),
        warganegara_id: asInt(row.warganegara_id, null),
        golongan_darah_id: asInt(row.golongan_darah_id, null),
        cacat_id: asInt(row.cacat_id, null),
        cara_kb_id: asInt(row.cara_kb_id, null),
        hamil: asInt(row.hamil, 0),
        ktp_el: asInt(row.ktp_el, 0),
        status_rekam: asInt(row.status_rekam, null),
        status_dasar: asInt(row.status_dasar, null),
        id_asuransi: asInt(row.id_asuransi, null),
        ayah_nik: asString(row.ayah_nik) || null,
        nama_ayah: asString(row.nama_ayah) || null,
        ibu_nik: asString(row.ibu_nik) || null,
        nama_ibu: asString(row.nama_ibu) || null,
        akta_lahir: asString(row.akta_lahir) || null,
        dokumen_pasport: asString(row.dokumen_pasport) || null,
        tanggal_akhir_paspor: asDate(row.tanggal_akhir_paspor),
        dokumen_kitas: asString(row.dokumen_kitas) || null,
        akta_perkawinan: asString(row.akta_perkawinan) || null,
        tanggalperkawinan: asDate(row.tanggalperkawinan),
        akta_perceraian: asString(row.akta_perceraian) || null,
        tanggalperceraian: asDate(row.tanggalperceraian),
        alamat_sekarang: asString(row.alamat_sekarang) || null,
        suku: asString(row.suku) || null,
        tag_id_card: asString(row.tag_id_card) || null,
        no_asuransi: asString(row.no_asuransi) || null,
        lat: asString(row.lat) || null,
        lng: asString(row.lng) || null,
      };
      const existing = await prisma.penduduk.findUnique({ where: { nik } });
      if (existing) {
        await prisma.penduduk.update({ where: { nik }, data });
        result.updated++;
      } else {
        await prisma.penduduk.create({ data: { nik, ...data } });
        result.inserted++;
      }
    } catch (e) {
      result.errors.push(`[nik ${nik}] ${e}`);
    }
  }
  return result;
}

// ----- dispatcher -------------------------------------------------------

const handlers: Record<
  string,
  (baris: BarisImport[]) => Promise<ImporterResult>
> = {
  kode_data: handleKodeData,
  keluarga: handleKeluarga,
  penduduk: handlePenduduk,
};

export async function importKependudukan(
  data: HasilParse[],
): Promise<ImporterResult[]> {
  const urutan = ["kode_data", "keluarga", "penduduk"];
  const hasil: ImporterResult[] = [];
  for (const sheetKey of urutan) {
    const sheetData = data.find((d) => d.sheetKey === sheetKey);
    if (!sheetData || sheetData.baris.length === 0) continue;
    const handler = handlers[sheetKey];
    if (!handler) continue;
    hasil.push(await handler(sheetData.baris));
  }
  return hasil;
}