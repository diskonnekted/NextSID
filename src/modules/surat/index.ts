// Module surat.
// Backend queries & mutations untuk modul Surat Menyurat Desa.
// Mencakup: template surat (SuratFormat), arsip cetak (LogSurat),
// permohonan Layanan Mandiri (PermohonanSurat), dokumen/syarat (Dokumen),
// dan referensi syarat surat (RefSyaratSurat).
//
// Pola mengikuti OpenSID asli:
// - config_id untuk multi-tenant siap
// - Snapshot fields di LogSurat (nama_pamong, nama_jabatan, nama_surat, kode_surat)
// - M:N SuratFormat <-> RefSyaratSurat via JSON string syarat_surat
// - Soft delete: Dokumen pakai kolom deleted; LogSurat pakai deleted_at

import { prisma } from "@/lib/prisma";
import { ambilConfigId } from "@/modules/info-desa";

// =====================================================================
// READ: ambilConfigId sudah di-import dari info-desa
// =====================================================================

// =====================================================================
// SURAT FORMAT (Template Surat)
// =====================================================================

export async function ambilDaftarFormat() {
  const configId = await ambilConfigId();
  return prisma.suratFormat.findMany({
    where: { config_id: configId },
    orderBy: [{ jenis: "asc" }, { nama: "asc" }],
  });
}

export async function ambilFormat(id: number) {
  return prisma.suratFormat.findUnique({ where: { id } });
}

export type SimpanFormatArgs = Partial<{
  nama: string;
  url_surat: string;
  kode_surat: string;
  lampiran: string;
  kunci: number;
  favorit: number;
  jenis: number;
  mandiri: number;
  masa_berlaku: number;
  satuan_masa_berlaku: string;
  qr_code: number;
  qr_code_tte: number;
  logo_garuda: number;
  kecamatan: number;
  // JSON string list id SyaratSurat, mis. "[1,2,3]"
  syarat_surat: string;
  template: string;
  template_desa: string;
  form_isian: string;
  kode_isian: string;
  orientasi: string;
  ukuran: string;
  margin: string;
  margin_global: number;
  footer: number;
  header: number;
  format_nomor: string;
  format_nomor_global: number;
  sumber_penduduk_berulang: number;
}>;

export async function tambahFormat(args: SimpanFormatArgs) {
  const configId = await ambilConfigId();
  const namaBersih = (args.nama ?? "").trim();
  if (!namaBersih) {
    throw new Error("Nama template surat wajib diisi.");
  }
  const url = (args.url_surat ?? "").trim();
  if (url) {
    const duplikat = await prisma.suratFormat.findFirst({
      where: { config_id: configId, url_surat: url },
    });
    if (duplikat) {
      throw new Error(`URL surat "${url}" sudah dipakai template lain.`);
    }
  }
  return prisma.suratFormat.create({
    data: {
      config_id: configId,
      nama: namaBersih,
      url_surat: url || null,
      kode_surat: args.kode_surat ?? null,
      lampiran: args.lampiran ?? null,
      kunci: args.kunci ?? 0,
      favorit: args.favorit ?? 0,
      jenis: args.jenis ?? 2,
      mandiri: args.mandiri ?? 0,
      masa_berlaku: args.masa_berlaku ?? null,
      satuan_masa_berlaku: args.satuan_masa_berlaku ?? null,
      qr_code: args.qr_code ?? 0,
      qr_code_tte: args.qr_code_tte ?? 0,
      logo_garuda: args.logo_garuda ?? 0,
      kecamatan: args.kecamatan ?? 1,
      syarat_surat: args.syarat_surat ?? null,
      template: args.template ?? null,
      template_desa: args.template_desa ?? null,
      form_isian: args.form_isian ?? null,
      kode_isian: args.kode_isian ?? null,
      orientasi: args.orientasi ?? null,
      ukuran: args.ukuran ?? null,
      margin: args.margin ?? null,
      margin_global: args.margin_global ?? 1,
      footer: args.footer ?? 1,
      header: args.header ?? 1,
      format_nomor: args.format_nomor ?? null,
      format_nomor_global: args.format_nomor_global ?? 1,
      sumber_penduduk_berulang: args.sumber_penduduk_berulang ?? 0,
    },
  });
}

export async function ubahFormat(id: number, args: SimpanFormatArgs) {
  const configId = await ambilConfigId();
  const existing = await prisma.suratFormat.findUnique({ where: { id } });
  if (!existing) throw new Error("Template surat tidak ditemukan.");
  if (existing.kunci === 1) {
    throw new Error("Template dikunci (kunci=1), tidak bisa diubah.");
  }
  // Validasi unik url_surat
  if (args.url_surat && args.url_surat !== existing.url_surat) {
    const bentrok = await prisma.suratFormat.findFirst({
      where: { config_id: configId, url_surat: args.url_surat, NOT: { id } },
    });
    if (bentrok) {
      throw new Error(`URL surat "${args.url_surat}" sudah dipakai template lain.`);
    }
  }
  return prisma.suratFormat.update({ where: { id }, data: args });
}

export async function hapusFormat(id: number) {
  const existing = await prisma.suratFormat.findUnique({ where: { id } });
  if (!existing) throw new Error("Template surat tidak ditemukan.");
  if (existing.kunci === 1) {
    throw new Error("Template dikunci (kunci=1), tidak bisa dihapus.");
  }
  await prisma.suratFormat.delete({ where: { id } });
}

// =====================================================================
// REF SYARAT SURAT
// =====================================================================

export async function ambilDaftarSyarat() {
  const configId = await ambilConfigId();
  return prisma.refSyaratSurat.findMany({
    where: { config_id: configId },
    orderBy: { ref_syarat_nama: "asc" },
  });
}

export async function tambahSyarat(nama: string) {
  const configId = await ambilConfigId();
  const namaBersih = nama.trim();
  if (!namaBersih) throw new Error("Nama syarat wajib diisi.");
  const duplikat = await prisma.refSyaratSurat.findFirst({
    where: { config_id: configId, ref_syarat_nama: namaBersih },
  });
  if (duplikat) throw new Error(`Syarat "${namaBersih}" sudah ada.`);
  return prisma.refSyaratSurat.create({
    data: { config_id: configId, ref_syarat_nama: namaBersih },
  });
}

export async function hapusSyarat(id: number) {
  await prisma.refSyaratSurat.delete({ where: { id } });
}

// =====================================================================
// LOG SURAT (Arsip cetak)
// =====================================================================

export async function ambilDaftarLogSurat() {
  const configId = await ambilConfigId();
  return prisma.logSurat.findMany({
    where: { config_id: configId, deleted_at: null },
    include: {
      formatSurat: true,
      penduduk: true,
      pamong: true,
    },
    orderBy: { created_at: "desc" },
    take: 200,
  });
}

export async function ambilLogSurat(id: number) {
  return prisma.logSurat.findUnique({
    where: { id },
    include: {
      formatSurat: true,
      penduduk: true,
      pamong: true,
      tolak: true,
    },
  });
}

export type SimpanLogSuratArgs = Partial<{
  id_format_surat: number;
  id_pend: number;
  id_pamong: number;
  // Snapshot fields
  nama_pamong: string;
  nama_jabatan: string;
  nama_surat: string;
  kode_surat: string;
  // Penomoran & tanggal
  tanggal: string; // ISO date string
  bulan: string;
  tahun: string;
  no_surat: string;
  lampiran: string;
  // Non-warga
  nik_non_warga: string;
  nama_non_warga: string;
  // Metadata
  keterangan: string;
  lokasi_arsip: string;
  // Status: 0=KONSEP, 1=CETAK, -1=TOLAK
  status: number;
  // TTE & verifikasi
  verifikasi_operator: number;
  verifikasi_kades: number;
  verifikasi_sekdes: number;
  // Isi surat (JSON)
  isi_surat: string;
  kecamatan: string;
  pemohon: string;
}>;

export async function tambahLogSurat(args: SimpanLogSuratArgs) {
  const configId = await ambilConfigId();
  if (!args.id_format_surat) {
    throw new Error("Template surat (id_format_surat) wajib diisi.");
  }
  // Ambil snapshot dari master SuratFormat agar data historis terjaga
  const fmt = await prisma.suratFormat.findUnique({
    where: { id: args.id_format_surat },
  });
  if (!fmt) throw new Error("Template surat tidak ditemukan.");
  // Snapshot Pamong jika ada
  let snapPamong = args.nama_pamong ?? null;
  let snapJabatan = args.nama_jabatan ?? null;
  if (args.id_pamong && (!snapPamong || !snapJabatan)) {
    const p = await prisma.pamong.findUnique({
      where: { id: args.id_pamong },
      include: { jabatan: true },
    });
    if (p) {
      snapPamong = snapPamong ?? p.pamong_nama;
      snapJabatan = snapJabatan ?? p.jabatan?.nama ?? null;
    }
  }
  return prisma.logSurat.create({
    data: {
      config_id: configId,
      id_format_surat: args.id_format_surat,
      id_pend: args.id_pend ?? null,
      id_pamong: args.id_pamong ?? null,
      nama_pamong: snapPamong,
      nama_jabatan: snapJabatan,
      nama_surat: args.nama_surat ?? fmt.nama,
      kode_surat: args.kode_surat ?? fmt.kode_surat ?? null,
      tanggal: args.tanggal ? new Date(args.tanggal) : new Date(),
      bulan: args.bulan ?? new Date().toLocaleString("id-ID", { month: "long" }),
      tahun:
        args.tahun ?? new Date().getFullYear().toString(),
      no_surat: args.no_surat ?? null,
      lampiran: args.lampiran ?? null,
      nik_non_warga: args.nik_non_warga ?? null,
      nama_non_warga: args.nama_non_warga ?? null,
      keterangan: args.keterangan ?? null,
      lokasi_arsip: args.lokasi_arsip ?? null,
      status: args.status ?? 0,
      verifikasi_operator: args.verifikasi_operator ?? 0,
      verifikasi_kades: args.verifikasi_kades ?? 0,
      verifikasi_sekdes: args.verifikasi_sekdes ?? 0,
      isi_surat: args.isi_surat ?? null,
      kecamatan: args.kecamatan ?? null,
      pemohon: args.pemohon ?? null,
    },
  });
}

export async function ubahLogSurat(id: number, args: SimpanLogSuratArgs) {
  const existing = await prisma.logSurat.findUnique({ where: { id } });
  if (!existing) throw new Error("Log surat tidak ditemukan.");
  return prisma.logSurat.update({
    where: { id },
    data: {
      ...args,
      tanggal: args.tanggal ? new Date(args.tanggal) : undefined,
    },
  });
}

export async function setStatusLogSurat(id: number, status: number) {
  if (![0, 1, -1].includes(status)) {
    throw new Error("Status tidak valid (0=KONSEP, 1=CETAK, -1=TOLAK).");
  }
  return prisma.logSurat.update({ where: { id }, data: { status } });
}

export async function softHapusLogSurat(id: number) {
  return prisma.logSurat.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
}

// =====================================================================
// LOG TOLAK
// =====================================================================

export async function tambahLogTolak(args: {
  id_surat: number;
  alasan: string;
  nama?: string;
  created_by?: number;
}) {
  const configId = await ambilConfigId();
  const alasanBersih = (args.alasan ?? "").trim();
  if (!alasanBersih) throw new Error("Alasan penolakan wajib diisi.");
  return prisma.logTolak.create({
    data: {
      config_id: configId,
      id_surat: args.id_surat,
      alasan: alasanBersih,
      nama: args.nama ?? null,
      created_by: args.created_by ?? null,
    },
  });
}

// =====================================================================
// PERMOHONAN SURAT (Layanan Mandiri)
// =====================================================================

export async function ambilDaftarPermohonan() {
  const configId = await ambilConfigId();
  return prisma.permohonanSurat.findMany({
    where: { config_id: configId },
    include: {
      pemohon: true,
      surat: true,
    },
    orderBy: { created_at: "desc" },
  });
}

export async function ambilPermohonan(id: number) {
  return prisma.permohonanSurat.findUnique({
    where: { id },
    include: { pemohon: true, surat: true },
  });
}

export type SimpanPermohonanArgs = Partial<{
  id_pemohon: number;
  id_surat: number;
  isian_form: string; // JSON
  status: number; // 0..5
  alasan: string;
  keterangan: string;
  no_hp_aktif: string;
  syarat: string; // JSON list id dokumen
  no_antrian: string;
}>;

export async function tambahPermohonan(args: SimpanPermohonanArgs) {
  const configId = await ambilConfigId();
  if (!args.id_pemohon) throw new Error("Pemohon (id_pemohon) wajib diisi.");
  if (!args.id_surat) throw new Error("Jenis surat (id_surat) wajib diisi.");
  // Hitung no antrian otomatis per desa per hari kalau tidak diisi
  const today = new Date();
  const noAntrian =
    args.no_antrian ??
    (
      await prisma.permohonanSurat.count({
        where: {
          config_id: configId,
          created_at: { gte: new Date(today.toDateString()) },
        },
      })
    ).toString();
  return prisma.permohonanSurat.create({
    data: {
      config_id: configId,
      id_pemohon: args.id_pemohon,
      id_surat: args.id_surat,
      isian_form: args.isian_form ?? null,
      status: args.status ?? 0,
      alasan: args.alasan ?? null,
      keterangan: args.keterangan ?? null,
      no_hp_aktif: args.no_hp_aktif ?? null,
      syarat: args.syarat ?? null,
      no_antrian: noAntrian,
    },
  });
}

export async function ubahPermohonan(id: number, args: SimpanPermohonanArgs) {
  return prisma.permohonanSurat.update({ where: { id }, data: args });
}

export async function setStatusPermohonan(id: number, status: number) {
  if (status < 0 || status > 5) {
    throw new Error("Status permohonan tidak valid (0..5).");
  }
  return prisma.permohonanSurat.update({ where: { id }, data: { status } });
}

export async function hapusPermohonan(id: number) {
  await prisma.permohonanSurat.delete({ where: { id } });
}

export async function cetakDariPermohonan(idPermohonan: number) {
  const configId = await ambilConfigId();
  const perm = await prisma.permohonanSurat.findUnique({
    where: { id: idPermohonan },
    include: {
      pemohon: true,
      surat: { select: { nama: true, kode_surat: true } },
    },
  });
  if (!perm) throw new Error("Permohonan tidak ditemukan.");
  if (!perm.id_surat) throw new Error("Jenis surat belum ditentukan.");

  const fmt = await prisma.suratFormat.findUnique({
    where: { id: perm.id_surat },
  });
  if (!fmt) throw new Error("Template surat tidak ditemukan.");

  // Buat LogSurat dari PermohonanSurat
  return prisma.logSurat.create({
    data: {
      config_id: configId,
      id_format_surat: perm.id_surat,
      id_pend: perm.id_pemohon,
      nama_pamong: null,
      nama_jabatan: null,
      nama_surat: fmt.nama,
      kode_surat: fmt.kode_surat,
      tanggal: new Date(),
      bulan: new Date().toLocaleString("id-ID", { month: "long" }),
      tahun: new Date().getFullYear().toString(),
      no_surat: null,
      lampiran: null,
      keterangan: `Dari permohonan #${perm.no_antrian}`,
      lokasi_arsip: null,
      status: 0,
      verifikasi_operator: 0,
      verifikasi_kades: 0,
      verifikasi_sekdes: 0,
      isi_surat: perm.isian_form,
      kecamatan: null,
      pemohon: perm.pemohon?.nama ?? null,
    },
  });
}

// =====================================================================
// DOKUMEN (Lampiran/Syarat)
// =====================================================================

export async function ambilDaftarDokumen(opts?: { id_pend?: number; kategori?: number }) {
  const configId = await ambilConfigId();
  return prisma.dokumen.findMany({
    where: {
      config_id: configId,
      deleted: 0,
      id_pend: opts?.id_pend ?? undefined,
      kategori: opts?.kategori ?? undefined,
    },
    orderBy: { tgl_upload: "desc" },
  });
}

export type SimpanDokumenArgs = Partial<{
  nama: string;
  satuan: string;
  enabled: number;
  id_pend: number;
  id_syarat: number;
  kategori_info_publik: number;
  id_parent: number;
  dok_warga: number;
  lokasi_arsip: string;
  attr: string;
  tipe: string;
  url: string;
  tahun: string;
  kategori: number;
}>;

export async function tambahDokumen(args: SimpanDokumenArgs) {
  const configId = await ambilConfigId();
  const namaBersih = (args.nama ?? "").trim();
  if (!namaBersih) throw new Error("Nama dokumen wajib diisi.");
  return prisma.dokumen.create({
    data: {
      config_id: configId,
      nama: namaBersih,
      satuan: args.satuan ?? null,
      enabled: args.enabled ?? 1,
      id_pend: args.id_pend ?? null,
      id_syarat: args.id_syarat ?? null,
      kategori_info_publik: args.kategori_info_publik ?? 0,
      id_parent: args.id_parent ?? null,
      dok_warga: args.dok_warga ?? 0,
      lokasi_arsip: args.lokasi_arsip ?? null,
      attr: args.attr ?? null,
      tipe: args.tipe ?? null,
      url: args.url ?? null,
      tahun: args.tahun ?? null,
      kategori: args.kategori ?? 1,
    },
  });
}

export async function ubahDokumen(id: number, args: SimpanDokumenArgs) {
  return prisma.dokumen.update({ where: { id }, data: args });
}

export async function softHapusDokumen(id: number) {
  return prisma.dokumen.update({ where: { id }, data: { deleted: 1 } });
}

// =====================================================================
// Statistik ringkas (untuk dashboard / halaman utama)
// =====================================================================

export async function ambilRingkasanSurat() {
  const configId = await ambilConfigId();
  const [totalFormat, totalLog, logKonsep, logCetak, totalPermohonan, permohonanSelesai, totalDokumen, totalSyarat] =
    await Promise.all([
      prisma.suratFormat.count({ where: { config_id: configId } }),
      prisma.logSurat.count({ where: { config_id: configId, deleted_at: null } }),
      prisma.logSurat.count({ where: { config_id: configId, deleted_at: null, status: 0 } }),
      prisma.logSurat.count({ where: { config_id: configId, deleted_at: null, status: 1 } }),
      prisma.permohonanSurat.count({ where: { config_id: configId } }),
      prisma.permohonanSurat.count({ where: { config_id: configId, status: 4 } }),
      prisma.dokumen.count({ where: { config_id: configId, deleted: 0 } }),
      prisma.refSyaratSurat.count({ where: { config_id: configId } }),
    ]);
  return {
    totalFormat,
    totalLog,
    logKonsep,
    logCetak,
    totalPermohonan,
    permohonanSelesai,
    totalDokumen,
    totalSyarat,
  };
}