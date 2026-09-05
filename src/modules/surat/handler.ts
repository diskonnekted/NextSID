// Module surat - handler.ts
// Adapter dari FormData (Server Actions) ke args module surat.

"use server";

import {
  tambahFormat,
  ubahFormat,
  hapusFormat,
  tambahSyarat,
  hapusSyarat,
  tambahLogSurat,
  ubahLogSurat,
  setStatusLogSurat,
  softHapusLogSurat,
  tambahLogTolak,
  tambahPermohonan,
  ubahPermohonan,
  setStatusPermohonan,
  hapusPermohonan,
  tambahDokumen,
  ubahDokumen,
  softHapusDokumen,
} from "./index";

function fdInt(fd: FormData, key: string): number | undefined {
  const v = fd.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function fdStr(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function fdBool(fd: FormData, key: string, defaultVal = 0): number {
  const v = fd.get(key);
  if (v === null) return defaultVal;
  return v === "1" || v === "on" || v === "true" ? 1 : 0;
}

// ---- SURAT FORMAT ----

export async function aksiTambahFormat(fd: FormData) {
  await tambahFormat({
    nama: fdStr(fd, "nama") ?? "",
    url_surat: fdStr(fd, "url_surat"),
    kode_surat: fdStr(fd, "kode_surat"),
    lampiran: fdStr(fd, "lampiran"),
    kunci: fdInt(fd, "kunci") ?? 0,
    favorit: fdInt(fd, "favorit") ?? 0,
    jenis: fdInt(fd, "jenis") ?? 2,
    mandiri: fdInt(fd, "mandiri") ?? 0,
    masa_berlaku: fdInt(fd, "masa_berlaku"),
    satuan_masa_berlaku: fdStr(fd, "satuan_masa_berlaku"),
    qr_code: fdInt(fd, "qr_code") ?? 0,
    qr_code_tte: fdInt(fd, "qr_code_tte") ?? 0,
    logo_garuda: fdInt(fd, "logo_garuda") ?? 0,
    kecamatan: fdInt(fd, "kecamatan") ?? 1,
    // Multi-select syarat_surat -> JSON string
    syarat_surat: buildSyaratJson(fd),
    template: fdStr(fd, "template"),
    template_desa: fdStr(fd, "template_desa"),
    form_isian: fdStr(fd, "form_isian"),
    kode_isian: fdStr(fd, "kode_isian"),
    orientasi: fdStr(fd, "orientasi"),
    ukuran: fdStr(fd, "ukuran"),
    margin: fdStr(fd, "margin"),
    margin_global: fdInt(fd, "margin_global") ?? 1,
    footer: fdBool(fd, "footer", 1),
    header: fdBool(fd, "header", 1),
    format_nomor: fdStr(fd, "format_nomor"),
    format_nomor_global: fdInt(fd, "format_nomor_global") ?? 1,
    sumber_penduduk_berulang: fdInt(fd, "sumber_penduduk_berulang") ?? 0,
  });
}

export async function aksiUbahFormat(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID template wajib diisi.");
  await ubahFormat(id, {
    nama: fdStr(fd, "nama"),
    url_surat: fdStr(fd, "url_surat"),
    kode_surat: fdStr(fd, "kode_surat"),
    lampiran: fdStr(fd, "lampiran"),
    kunci: fdInt(fd, "kunci"),
    favorit: fdInt(fd, "favorit"),
    jenis: fdInt(fd, "jenis"),
    mandiri: fdInt(fd, "mandiri"),
    masa_berlaku: fdInt(fd, "masa_berlaku"),
    satuan_masa_berlaku: fdStr(fd, "satuan_masa_berlaku"),
    qr_code: fdInt(fd, "qr_code"),
    qr_code_tte: fdInt(fd, "qr_code_tte"),
    logo_garuda: fdInt(fd, "logo_garuda"),
    kecamatan: fdInt(fd, "kecamatan"),
    syarat_surat: buildSyaratJson(fd),
    template: fdStr(fd, "template"),
    template_desa: fdStr(fd, "template_desa"),
    form_isian: fdStr(fd, "form_isian"),
    kode_isian: fdStr(fd, "kode_isian"),
    orientasi: fdStr(fd, "orientasi"),
    ukuran: fdStr(fd, "ukuran"),
    margin: fdStr(fd, "margin"),
    margin_global: fdInt(fd, "margin_global"),
    footer: fdBool(fd, "footer", 1),
    header: fdBool(fd, "header", 1),
    format_nomor: fdStr(fd, "format_nomor"),
    format_nomor_global: fdInt(fd, "format_nomor_global"),
    sumber_penduduk_berulang: fdInt(fd, "sumber_penduduk_berulang"),
  });
}

export async function aksiHapusFormat(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID template wajib diisi.");
  await hapusFormat(id);
}

function buildSyaratJson(fd: FormData): string | undefined {
  const all = fd.getAll("syarat_ids[]").map((v) => Number(v)).filter((n) => Number.isFinite(n));
  if (all.length === 0) return undefined;
  return JSON.stringify(all);
}

// ---- REF SYARAT ----

export async function aksiTambahSyarat(fd: FormData) {
  await tambahSyarat(fdStr(fd, "nama") ?? "");
}

export async function aksiHapusSyarat(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID syarat wajib diisi.");
  await hapusSyarat(id);
}

// ---- LOG SURAT ----

export async function aksiTambahLogSurat(fd: FormData) {
  await tambahLogSurat({
    id_format_surat: fdInt(fd, "id_format_surat"),
    id_pend: fdInt(fd, "id_pend"),
    id_pamong: fdInt(fd, "id_pamong"),
    nama_pamong: fdStr(fd, "nama_pamong"),
    nama_jabatan: fdStr(fd, "nama_jabatan"),
    nama_surat: fdStr(fd, "nama_surat"),
    kode_surat: fdStr(fd, "kode_surat"),
    tanggal: fdStr(fd, "tanggal"),
    bulan: fdStr(fd, "bulan"),
    tahun: fdStr(fd, "tahun"),
    no_surat: fdStr(fd, "no_surat"),
    lampiran: fdStr(fd, "lampiran"),
    nik_non_warga: fdStr(fd, "nik_non_warga"),
    nama_non_warga: fdStr(fd, "nama_non_warga"),
    keterangan: fdStr(fd, "keterangan"),
    lokasi_arsip: fdStr(fd, "lokasi_arsip"),
    status: fdInt(fd, "status") ?? 0,
    verifikasi_operator: fdInt(fd, "verifikasi_operator") ?? 0,
    verifikasi_kades: fdInt(fd, "verifikasi_kades") ?? 0,
    verifikasi_sekdes: fdInt(fd, "verifikasi_sekdes") ?? 0,
    isi_surat: fdStr(fd, "isi_surat"),
    kecamatan: fdStr(fd, "kecamatan"),
    pemohon: fdStr(fd, "pemohon"),
  });
}

export async function aksiUbahLogSurat(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID log surat wajib diisi.");
  await ubahLogSurat(id, {
    id_format_surat: fdInt(fd, "id_format_surat"),
    id_pend: fdInt(fd, "id_pend"),
    id_pamong: fdInt(fd, "id_pamong"),
    nama_pamong: fdStr(fd, "nama_pamong"),
    nama_jabatan: fdStr(fd, "nama_jabatan"),
    nama_surat: fdStr(fd, "nama_surat"),
    kode_surat: fdStr(fd, "kode_surat"),
    tanggal: fdStr(fd, "tanggal"),
    bulan: fdStr(fd, "bulan"),
    tahun: fdStr(fd, "tahun"),
    no_surat: fdStr(fd, "no_surat"),
    lampiran: fdStr(fd, "lampiran"),
    nik_non_warga: fdStr(fd, "nik_non_warga"),
    nama_non_warga: fdStr(fd, "nama_non_warga"),
    keterangan: fdStr(fd, "keterangan"),
    lokasi_arsip: fdStr(fd, "lokasi_arsip"),
    status: fdInt(fd, "status"),
    verifikasi_operator: fdInt(fd, "verifikasi_operator"),
    verifikasi_kades: fdInt(fd, "verifikasi_kades"),
    verifikasi_sekdes: fdInt(fd, "verifikasi_sekdes"),
    isi_surat: fdStr(fd, "isi_surat"),
    kecamatan: fdStr(fd, "kecamatan"),
    pemohon: fdStr(fd, "pemohon"),
  });
}

export async function aksiSetStatusLogSurat(fd: FormData) {
  const id = fdInt(fd, "id");
  const status = fdInt(fd, "status");
  if (!id || status === undefined) throw new Error("ID dan status wajib diisi.");
  await setStatusLogSurat(id, status);
}

export async function aksiSoftHapusLogSurat(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID log surat wajib diisi.");
  await softHapusLogSurat(id);
}

export async function aksiTambahLogTolak(fd: FormData) {
  const id_surat = fdInt(fd, "id_surat");
  if (!id_surat) throw new Error("ID surat wajib diisi.");
  await tambahLogTolak({
    id_surat,
    alasan: fdStr(fd, "alasan") ?? "",
    nama: fdStr(fd, "nama"),
  });
}

// ---- PERMOHONAN SURAT ----

export async function aksiTambahPermohonan(fd: FormData) {
  await tambahPermohonan({
    id_pemohon: fdInt(fd, "id_pemohon"),
    id_surat: fdInt(fd, "id_surat"),
    isian_form: fdStr(fd, "isian_form"),
    status: fdInt(fd, "status") ?? 0,
    alasan: fdStr(fd, "alasan"),
    keterangan: fdStr(fd, "keterangan"),
    no_hp_aktif: fdStr(fd, "no_hp_aktif"),
    syarat: fdStr(fd, "syarat"),
    no_antrian: fdStr(fd, "no_antrian"),
  });
}

export async function aksiUbahPermohonan(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID permohonan wajib diisi.");
  await ubahPermohonan(id, {
    id_pemohon: fdInt(fd, "id_pemohon"),
    id_surat: fdInt(fd, "id_surat"),
    isian_form: fdStr(fd, "isian_form"),
    status: fdInt(fd, "status"),
    alasan: fdStr(fd, "alasan"),
    keterangan: fdStr(fd, "keterangan"),
    no_hp_aktif: fdStr(fd, "no_hp_aktif"),
    syarat: fdStr(fd, "syarat"),
    no_antrian: fdStr(fd, "no_antrian"),
  });
}

export async function aksiSetStatusPermohonan(fd: FormData) {
  const id = fdInt(fd, "id");
  const status = fdInt(fd, "status");
  if (!id || status === undefined) throw new Error("ID dan status wajib diisi.");
  await setStatusPermohonan(id, status);
}

export async function aksiHapusPermohonan(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID permohonan wajib diisi.");
  await hapusPermohonan(id);
}

// ---- DOKUMEN ----

export async function aksiTambahDokumen(fd: FormData) {
  await tambahDokumen({
    nama: fdStr(fd, "nama") ?? "",
    satuan: fdStr(fd, "satuan"),
    enabled: fdInt(fd, "enabled") ?? 1,
    id_pend: fdInt(fd, "id_pend"),
    id_syarat: fdInt(fd, "id_syarat"),
    kategori_info_publik: fdInt(fd, "kategori_info_publik") ?? 0,
    id_parent: fdInt(fd, "id_parent"),
    dok_warga: fdInt(fd, "dok_warga") ?? 0,
    lokasi_arsip: fdStr(fd, "lokasi_arsip"),
    attr: fdStr(fd, "attr"),
    tipe: fdStr(fd, "tipe"),
    url: fdStr(fd, "url"),
    tahun: fdStr(fd, "tahun"),
    kategori: fdInt(fd, "kategori") ?? 1,
  });
}

export async function aksiUbahDokumen(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID dokumen wajib diisi.");
  await ubahDokumen(id, {
    nama: fdStr(fd, "nama"),
    satuan: fdStr(fd, "satuan"),
    enabled: fdInt(fd, "enabled"),
    id_pend: fdInt(fd, "id_pend"),
    id_syarat: fdInt(fd, "id_syarat"),
    kategori_info_publik: fdInt(fd, "kategori_info_publik"),
    id_parent: fdInt(fd, "id_parent"),
    dok_warga: fdInt(fd, "dok_warga"),
    lokasi_arsip: fdStr(fd, "lokasi_arsip"),
    attr: fdStr(fd, "attr"),
    tipe: fdStr(fd, "tipe"),
    url: fdStr(fd, "url"),
    tahun: fdStr(fd, "tahun"),
    kategori: fdInt(fd, "kategori"),
  });
}

export async function aksiSoftHapusDokumen(fd: FormData) {
  const id = fdInt(fd, "id");
  if (!id) throw new Error("ID dokumen wajib diisi.");
  await softHapusDokumen(id);
}