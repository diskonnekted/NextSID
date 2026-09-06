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
import { revalidatePath } from "next/cache";
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

// =====================================================================
// CRUD Penduduk perorangan (server action untuk form UI manual).
// Berbeda dengan tambahAnggota: fungsi di bawah ini TIDAK mengharuskan
// penduduk terikat pada KK existing. Penduduk bisa disimpan sebagai
// individu terpisah (misalnya pendatang baru yang belum terdaftar di KK).
// =====================================================================

function str(v: FormDataEntryValue | null, fallback = ""): string {
  if (v == null) return fallback;
  return String(v).trim();
}

function numOrNull(v: FormDataEntryValue | null): number | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function parseTanggal(v: FormDataEntryValue | null): Date | null | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function parseEditNum(v: FormDataEntryValue | null): number | null | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (s === "") return undefined;
  const n = Number(s);
  return isNaN(n) ? undefined : n;
}

function parseEditStr(v: FormDataEntryValue | null): string | null | undefined {
  if (v == null) return undefined;
  const s = String(v);
  return s === "" ? undefined : s;
}

export type BuatPendudukArgs = {
  nik: string;
  nama: string;
  no_kk?: string | null;
  sex?: number | null;
  tempatlahir?: string | null;
  tanggallahir?: Date | null;
  kk_level?: number | null;
  agama_id?: number | null;
  pekerjaan_id?: number | null;
  status_kawin?: number | null;
  pendidikan_kk_id?: number | null;
  warganegara_id?: number | null;
  golongan_darah_id?: number | null;
};

async function buatPendudukInternal(args: BuatPendudukArgs): Promise<{ nik: string }> {
  if (!args.nik.trim()) throw new Error("NIK wajib diisi.");
  if (!args.nama.trim()) throw new Error("Nama wajib diisi.");
  if (!/^\d{16}$/.test(args.nik)) throw new Error("NIK harus 16 digit angka.");

  const existing = await prisma.penduduk.findUnique({ where: { nik: args.nik } });
  if (existing) throw new Error(`NIK ${args.nik} sudah terdaftar.`);

  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id ?? null;

  await prisma.penduduk.create({
    data: {
      nik: args.nik,
      no_kk: args.no_kk ?? null,
      config_id: configId,
      nama: args.nama,
      sex: args.sex ?? null,
      tempatlahir: args.tempatlahir ?? null,
      tanggallahir: args.tanggallahir ?? null,
      kk_level: args.kk_level ?? null,
      agama_id: args.agama_id ?? null,
      pekerjaan_id: args.pekerjaan_id ?? null,
      status_kawin: args.status_kawin ?? null,
      pendidikan_kk_id: args.pendidikan_kk_id ?? null,
      warganegara_id: args.warganegara_id ?? null,
      golongan_darah_id: args.golongan_darah_id ?? null,
      status_dasar: 1,
    },
  });
  return { nik: args.nik };
}

async function editPendudukInternal(args: {
  nikAsal: string;
  nik: string;
  nama: string;
  no_kk?: string | null;
  sex?: number | null | undefined;
  tempatlahir?: string | null | undefined;
  tanggallahir?: Date | null | undefined;
  kk_level?: number | null | undefined;
  agama_id?: number | null | undefined;
  pekerjaan_id?: number | null | undefined;
  status_kawin?: number | null | undefined;
  pendidikan_kk_id?: number | null | undefined;
  pendidikan_sedang_id?: number | null | undefined;
  warganegara_id?: number | null | undefined;
  golongan_darah_id?: number | null | undefined;
  cacat_id?: number | null | undefined;
  cara_kb_id?: number | null | undefined;
  hamil?: number | null | undefined;
  ktp_el?: number | null | undefined;
  status_rekam?: number | null | undefined;
  status_dasar?: number | null | undefined;
  id_asuransi?: number | null | undefined;
  ayah_nik?: string | null | undefined;
  nama_ayah?: string | null | undefined;
  ibu_nik?: string | null | undefined;
  nama_ibu?: string | null | undefined;
  akta_lahir?: string | null | undefined;
  dokumen_pasport?: string | null | undefined;
  tanggal_akhir_paspor?: Date | null | undefined;
  dokumen_kitas?: string | null | undefined;
  akta_perkawinan?: string | null | undefined;
  tanggalperkawinan?: Date | null | undefined;
  akta_perceraian?: string | null | undefined;
  tanggalperceraian?: Date | null | undefined;
  alamat_sekarang?: string | null | undefined;
  suku?: string | null | undefined;
  tag_id_card?: string | null | undefined;
  no_asuransi?: string | null | undefined;
  lat?: string | null | undefined;
  lng?: string | null | undefined;
  foto?: string | null | undefined;
}): Promise<void> {
  const existing = await prisma.penduduk.findUnique({ where: { nik: args.nikAsal } });
  if (!existing) throw new Error(`Penduduk NIK ${args.nikAsal} tidak ditemukan.`);

  if (args.nikAsal !== args.nik) {
    const duplikat = await prisma.penduduk.findUnique({ where: { nik: args.nik } });
    if (duplikat) throw new Error(`NIK ${args.nik} sudah dipakai warga lain.`);
    if (!/^\d{16}$/.test(args.nik)) throw new Error("NIK harus 16 digit angka.");
  }

  const updateData: any = {
    nik: args.nik,
    nama: args.nama,
  };
  if (args.no_kk !== undefined) updateData.no_kk = args.no_kk ?? null;
  if (args.sex !== undefined) updateData.sex = args.sex ?? null;
  if (args.tempatlahir !== undefined) updateData.tempatlahir = args.tempatlahir ?? null;
  if (args.tanggallahir !== undefined) updateData.tanggallahir = args.tanggallahir ?? null;
  if (args.kk_level !== undefined && args.kk_level !== null) updateData.kk_level = args.kk_level;
  if (args.agama_id !== undefined) updateData.agama_id = args.agama_id ?? null;
  if (args.pekerjaan_id !== undefined) updateData.pekerjaan_id = args.pekerjaan_id ?? null;
  if (args.status_kawin !== undefined) updateData.status_kawin = args.status_kawin ?? null;
  if (args.pendidikan_kk_id !== undefined) updateData.pendidikan_kk_id = args.pendidikan_kk_id ?? null;
  if (args.pendidikan_sedang_id !== undefined) updateData.pendidikan_sedang_id = args.pendidikan_sedang_id ?? null;
  if (args.warganegara_id !== undefined) updateData.warganegara_id = args.warganegara_id ?? null;
  if (args.golongan_darah_id !== undefined) updateData.golongan_darah_id = args.golongan_darah_id ?? null;
  if (args.cacat_id !== undefined) updateData.cacat_id = args.cacat_id ?? null;
  if (args.cara_kb_id !== undefined) updateData.cara_kb_id = args.cara_kb_id ?? null;
  if (args.hamil !== undefined) updateData.hamil = args.hamil ?? null;
  if (args.ktp_el !== undefined) updateData.ktp_el = args.ktp_el ?? null;
  if (args.status_rekam !== undefined) updateData.status_rekam = args.status_rekam ?? null;
  if (args.status_dasar !== undefined) updateData.status_dasar = args.status_dasar ?? null;
  if (args.id_asuransi !== undefined) updateData.id_asuransi = args.id_asuransi ?? null;
  if (args.ayah_nik !== undefined) updateData.ayah_nik = args.ayah_nik ?? null;
  if (args.nama_ayah !== undefined) updateData.nama_ayah = args.nama_ayah ?? null;
  if (args.ibu_nik !== undefined) updateData.ibu_nik = args.ibu_nik ?? null;
  if (args.nama_ibu !== undefined) updateData.nama_ibu = args.nama_ibu ?? null;
  if (args.akta_lahir !== undefined) updateData.akta_lahir = args.akta_lahir ?? null;
  if (args.dokumen_pasport !== undefined) updateData.dokumen_pasport = args.dokumen_pasport ?? null;
  if (args.tanggal_akhir_paspor !== undefined) updateData.tanggal_akhir_paspor = args.tanggal_akhir_paspor ?? null;
  if (args.dokumen_kitas !== undefined) updateData.dokumen_kitas = args.dokumen_kitas ?? null;
  if (args.akta_perkawinan !== undefined) updateData.akta_perkawinan = args.akta_perkawinan ?? null;
  if (args.tanggalperkawinan !== undefined) updateData.tanggalperkawinan = args.tanggalperkawinan ?? null;
  if (args.akta_perceraian !== undefined) updateData.akta_perceraian = args.akta_perceraian ?? null;
  if (args.tanggalperceraian !== undefined) updateData.tanggalperceraian = args.tanggalperceraian ?? null;
  if (args.alamat_sekarang !== undefined) updateData.alamat_sekarang = args.alamat_sekarang ?? null;
  if (args.suku !== undefined) updateData.suku = args.suku ?? null;
  if (args.tag_id_card !== undefined) updateData.tag_id_card = args.tag_id_card ?? null;
  if (args.no_asuransi !== undefined) updateData.no_asuransi = args.no_asuransi ?? null;
  if (args.lat !== undefined) updateData.lat = args.lat ?? null;
  if (args.lng !== undefined) updateData.lng = args.lng ?? null;
  if (args.foto !== undefined) updateData.foto = args.foto ?? null;

  await prisma.penduduk.update({
    where: { nik: args.nikAsal },
    data: updateData,
  });
}

async function hapusPendudukInternal(nik: string): Promise<void> {
  const p = await prisma.penduduk.findUnique({ where: { nik } });
  if (!p) return;
  if (p.kk_level === 1) {
    throw new Error(
      "Tidak dapat menghapus kepala keluarga lewat sini. Hapus KK seluruhnya dari halaman detail KK.",
    );
  }
  await prisma.penduduk.delete({ where: { nik } });
}

// Ambil data lengkap satu penduduk + nama-nama referensi (untuk form detail)
export async function ambilDetailPenduduk(nik: string) {
  if (!nik) return null;
  const p = await prisma.penduduk.findUnique({
    where: { nik },
    include: {
      kk_level_ref: true,
      agama: true,
      pekerjaan: true,
      pendidikan_kk: true,
      pendidikan_sedang: true,
      warganegara: true,
      golongan_darah: true,
      cacat: true,
      cara_kb: true,
      status_dasar_ref: true,
      asuransi: true,
      keluarga: { select: { no_kk: true, alamat: true, dusun: true, rw: true, rt: true } },
    },
  });
  if (!p) return null;

  // Lookup status kawin (tabel terpisah)
  let statusKawinNama: string | null = null;
  if (p.status_kawin != null) {
    const sk = await prisma.refStatusKawin.findUnique({
      where: { id: p.status_kawin },
      select: { nama: true },
    });
    statusKawinNama = sk?.nama ?? null;
  }

  // Lookup ayah & ibu
  let ayah: { nik: string; nama: string } | null = null;
  let ibu: { nik: string; nama: string } | null = null;
  if (p.ayah_nik) {
    const a = await prisma.penduduk.findUnique({
      where: { nik: p.ayah_nik },
      select: { nik: true, nama: true },
    });
    if (a) ayah = { nik: a.nik, nama: a.nama };
  }
  if (p.ibu_nik) {
    const i = await prisma.penduduk.findUnique({
      where: { nik: p.ibu_nik },
      select: { nik: true, nama: true },
    });
    if (i) ibu = { nik: i.nik, nama: i.nama };
  }

  return {
    id: p.id,
    nik: p.nik,
    nama: p.nama,
    no_kk: p.no_kk,
    sex: p.sex,
    tempatlahir: p.tempatlahir,
    tanggallahir: p.tanggallahir,
    kk_level: p.kk_level,
    hubungan_kk: p.kk_level_ref?.nama ?? null,
    status_kawin: p.status_kawin,
    status_kawin_nama: statusKawinNama,
    agama: p.agama?.nama ?? null,
    agama_id: p.agama_id,
    pekerjaan: p.pekerjaan?.nama ?? null,
    pekerjaan_id: p.pekerjaan_id,
    pendidikan: p.pendidikan_kk?.nama ?? null,
    pendidikan_kk_id: p.pendidikan_kk_id,
    pendidikan_sedang: p.pendidikan_sedang?.nama ?? null,
    pendidikan_sedang_id: p.pendidikan_sedang_id,
    warganegara: p.warganegara?.nama ?? null,
    warganegara_id: p.warganegara_id,
    golongan_darah: p.golongan_darah?.nama ?? null,
    golongan_darah_id: p.golongan_darah_id,
    cacat: p.cacat?.nama ?? null,
    cacat_id: p.cacat_id,
    cara_kb: p.cara_kb?.nama ?? null,
    cara_kb_id: p.cara_kb_id,
    hamil: p.hamil,
    ktp_el: p.ktp_el,
    status_rekam: p.status_rekam,
    status_dasar: p.status_dasar,
    status_dasar_ref: p.status_dasar_ref?.nama ?? null,
    id_asuransi: p.id_asuransi,
    asuransi: p.asuransi?.nama ?? null,
    ayah_nik: p.ayah_nik,
    nama_ayah: p.nama_ayah,
    ibu_nik: p.ibu_nik,
    nama_ibu: p.nama_ibu,
    akta_lahir: p.akta_lahir,
    dokumen_pasport: p.dokumen_pasport,
    tanggal_akhir_paspor: p.tanggal_akhir_paspor,
    dokumen_kitas: p.dokumen_kitas,
    akta_perkawinan: p.akta_perkawinan,
    tanggalperkawinan: p.tanggalperkawinan,
    akta_perceraian: p.akta_perceraian,
    tanggalperceraian: p.tanggalperceraian,
    alamat_sekarang: p.alamat_sekarang,
    suku: p.suku,
    tag_id_card: p.tag_id_card,
    no_asuransi: p.no_asuransi,
    lat: p.lat,
    lng: p.lng,
    foto: p.foto,
    keluarga: p.keluarga,
    ayah,
    ibu,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

// Daftar KK (dropdown pilih KK saat tambah penduduk)
export async function ambilDaftarKKUntukDropdown(): Promise<
  Array<{ no_kk: string; kepala: string | null }>
> {
  const kk = await prisma.keluarga.findMany({
    orderBy: { no_kk: "asc" },
    include: {
      anggota: {
        where: { kk_level: 1 },
        take: 1,
        select: { nama: true },
      },
    },
    take: 500,
  });
  return kk.map((k) => ({
    no_kk: k.no_kk,
    kepala: k.anggota[0]?.nama ?? null,
  }));
}

// ---------- Server Actions ----------

export async function aksiBuatPenduduk(formData: FormData) {
  const result = await buatPendudukInternal({
    nik: str(formData.get("nik")),
    nama: str(formData.get("nama")),
    no_kk: str(formData.get("no_kk")) || null,
    sex: numOrNull(formData.get("sex")),
    tempatlahir: str(formData.get("tempatlahir")) || null,
    tanggallahir: parseTanggal(formData.get("tanggallahir")) ?? null,
    kk_level: numOrNull(formData.get("kk_level")),
    agama_id: numOrNull(formData.get("agama_id")),
    pekerjaan_id: numOrNull(formData.get("pekerjaan_id")),
    status_kawin: numOrNull(formData.get("status_kawin")),
    pendidikan_kk_id: numOrNull(formData.get("pendidikan_kk_id")),
    warganegara_id: numOrNull(formData.get("warganegara_id")),
    golongan_darah_id: numOrNull(formData.get("golongan_darah_id")),
  });
  revalidatePath("/admin/kependudukan");
  return { ok: true, nik: result.nik };
}

export async function aksiEditPenduduk(formData: FormData) {
  await editPendudukInternal({
    nikAsal: str(formData.get("nikAsal")),
    nik: str(formData.get("nik")),
    nama: str(formData.get("nama")),
    no_kk: str(formData.get("no_kk")) || null,
    sex: parseEditNum(formData.get("sex")),
    tempatlahir: parseEditStr(formData.get("tempatlahir")),
    tanggallahir: parseTanggal(formData.get("tanggallahir")),
    kk_level: parseEditNum(formData.get("kk_level")),
    agama_id: parseEditNum(formData.get("agama_id")),
    pekerjaan_id: parseEditNum(formData.get("pekerjaan_id")),
    status_kawin: parseEditNum(formData.get("status_kawin")),
    pendidikan_kk_id: parseEditNum(formData.get("pendidikan_kk_id")),
    pendidikan_sedang_id: parseEditNum(formData.get("pendidikan_sedang_id")),
    warganegara_id: parseEditNum(formData.get("warganegara_id")),
    golongan_darah_id: parseEditNum(formData.get("golongan_darah_id")),
    cacat_id: parseEditNum(formData.get("cacat_id")),
    cara_kb_id: parseEditNum(formData.get("cara_kb_id")),
    hamil: parseEditNum(formData.get("hamil")),
    ktp_el: parseEditNum(formData.get("ktp_el")),
    status_rekam: parseEditNum(formData.get("status_rekam")),
    status_dasar: parseEditNum(formData.get("status_dasar")),
    id_asuransi: parseEditNum(formData.get("id_asuransi")),
    ayah_nik: parseEditStr(formData.get("ayah_nik")),
    nama_ayah: parseEditStr(formData.get("nama_ayah")),
    ibu_nik: parseEditStr(formData.get("ibu_nik")),
    nama_ibu: parseEditStr(formData.get("nama_ibu")),
    akta_lahir: parseEditStr(formData.get("akta_lahir")),
    dokumen_pasport: parseEditStr(formData.get("dokumen_pasport")),
    tanggal_akhir_paspor: parseTanggal(formData.get("tanggal_akhir_paspor")),
    dokumen_kitas: parseEditStr(formData.get("dokumen_kitas")),
    akta_perkawinan: parseEditStr(formData.get("akta_perkawinan")),
    tanggalperkawinan: parseTanggal(formData.get("tanggalperkawinan")),
    akta_perceraian: parseEditStr(formData.get("akta_perceraian")),
    tanggalperceraian: parseTanggal(formData.get("tanggalperceraian")),
    alamat_sekarang: parseEditStr(formData.get("alamat_sekarang")),
    suku: parseEditStr(formData.get("suku")),
    tag_id_card: parseEditStr(formData.get("tag_id_card")),
    no_asuransi: parseEditStr(formData.get("no_asuransi")),
    lat: parseEditStr(formData.get("lat")),
    lng: parseEditStr(formData.get("lng")),
    foto: parseEditStr(formData.get("foto")),
  });
  revalidatePath("/admin/kependudukan");
  revalidatePath(`/admin/kependudukan/${str(formData.get("nikAsal"))}`);
  revalidatePath(`/admin/kependudukan/${str(formData.get("nik"))}`);
  return { ok: true };
}

export async function aksiHapusPenduduk(nik: string) {
  await hapusPendudukInternal(nik);
  revalidatePath("/admin/kependudukan");
  return { ok: true };
}