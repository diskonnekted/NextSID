// Server actions untuk module info-desa.
// Dipanggil dari client component dengan useTransition.

"use server";

import { revalidatePath } from "next/cache";
import {
  simpanIdentitas,
  tambahWilayah,
  hapusWilayah,
  tambahJabatan,
  hapusJabatan,
  editJabatan,
  tambahPamong,
  hapusPamong,
  editPamong,
  simpanProfil,
  tambahLembaga,
  hapusLembaga,
  editLembaga,
  tambahLayanan,
  hapusLayanan,
  tambahKerjasama,
  hapusKerjasama,
} from "./index";

function parseTanggal(v: unknown): Date | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function numOrNull(v: unknown): number | null | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function strOrNull(v: unknown): string | null | undefined {
  if (v == null) return undefined;
  const s = String(v);
  return s === "" ? null : s;
}

// ---- Identitas ----
export async function aksiSimpanIdentitas(formData: FormData) {
  await simpanIdentitas({
    nama_desa: str(formData.get("nama_desa")),
    kode_desa: str(formData.get("kode_desa")) || undefined,
    kode_desa_bps: str(formData.get("kode_desa_bps")) || undefined,
    kode_pos: str(formData.get("kode_pos")) || undefined,
    alamat: str(formData.get("alamat")) || undefined,
    alamat_kantor: str(formData.get("alamat_kantor")) || undefined,
    email: str(formData.get("email")) || undefined,
    telepon: str(formData.get("telepon")) || undefined,
    nomor_operator: str(formData.get("nomor_operator")) || undefined,
    website: str(formData.get("website")) || undefined,
    nama_kecamatan: str(formData.get("nama_kecamatan")) || undefined,
    kode_kecamatan: str(formData.get("kode_kecamatan")) || undefined,
    nama_kepala_camat: str(formData.get("nama_kepala_camat")) || undefined,
    nip_kepala_camat: str(formData.get("nip_kepala_camat")) || undefined,
    nama_kabupaten: str(formData.get("nama_kabupaten")) || undefined,
    kode_kabupaten: str(formData.get("kode_kabupaten")) || undefined,
    nama_propinsi: str(formData.get("nama_propinsi")) || undefined,
    kode_propinsi: str(formData.get("kode_propinsi")) || undefined,
    nama_kontak: str(formData.get("nama_kontak")) || undefined,
    hp_kontak: str(formData.get("hp_kontak")) || undefined,
    jabatan_kontak: str(formData.get("jabatan_kontak")) || undefined,
    lat: str(formData.get("lat")) || undefined,
    lng: str(formData.get("lng")) || undefined,
    zoom: num(formData.get("zoom")),
    map_tipe: str(formData.get("map_tipe")) || undefined,
  });
  revalidatePath("/admin/info-desa/identitas");
  revalidatePath("/admin/info-desa");
  return { ok: true };
}

// ---- Wilayah ----
export async function aksiTambahWilayah(formData: FormData) {
  await tambahWilayah({
    dusun: str(formData.get("dusun")),
    rw: str(formData.get("rw"), "0") || "0",
    rt: str(formData.get("rt"), "0") || "0",
    id_kepala: str(formData.get("id_kepala")) || undefined,
  });
  revalidatePath("/admin/info-desa/wilayah");
  return { ok: true };
}

export async function aksiHapusWilayah(id: number) {
  await hapusWilayah(id);
  revalidatePath("/admin/info-desa/wilayah");
  return { ok: true };
}

// ---- Jabatan ----
export async function aksiTambahJabatan(formData: FormData) {
  await tambahJabatan({
    nama: str(formData.get("nama")),
    jenis: num(formData.get("jenis")) ?? 0,
    tupoksi: str(formData.get("tupoksi")) || undefined,
  });
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

export async function aksiHapusJabatan(id: number) {
  await hapusJabatan(id);
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

export async function aksiEditJabatan(formData: FormData) {
  const id = Number(formData.get("id"));
  // nama wajib (required di form). tupoksi & jenis opsional.
  const namaRaw = formData.get("nama");
  const namaStr = namaRaw == null ? "" : String(namaRaw);
  await editJabatan({
    id,
    nama: namaStr, // required, selalu kirim
    jenis: numOrNull(formData.get("jenis")) ?? undefined,
    tupoksi: strOrNull(formData.get("tupoksi")),
  });
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

// ---- Pamong ----
export async function aksiTambahPamong(formData: FormData) {
  await tambahPamong({
    pamong_nama: str(formData.get("pamong_nama")),
    pamong_nik: str(formData.get("pamong_nik")) || undefined,
    jabatan_id: num(formData.get("jabatan_id")),
    pamong_status: num(formData.get("pamong_status")) ?? 1,
    status_pejabat: num(formData.get("status_pejabat")) ?? 0,
    no_hp: str(formData.get("no_hp")) || undefined,
    tempatlahir: str(formData.get("tempatlahir")) || undefined,
    tanggallahir: parseTanggal(formData.get("tanggallahir")),
    sex: num(formData.get("sex")),
    gelar_depan: str(formData.get("gelar_depan")) || undefined,
    gelar_belakang: str(formData.get("gelar_belakang")) || undefined,
  });
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

export async function aksiHapusPamong(id: number) {
  await hapusPamong(id);
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

export async function aksiEditPamong(formData: FormData) {
  const id = Number(formData.get("id"));
  await editPamong({
    id,
    pamong_nama: String(formData.get("pamong_nama") ?? ""),
    pamong_nik: strOrNull(formData.get("pamong_nik")),
    jabatan_id: numOrNull(formData.get("jabatan_id")),
    pamong_status: numOrNull(formData.get("pamong_status")) ?? undefined,
    status_pejabat: numOrNull(formData.get("status_pejabat")) ?? undefined,
    no_hp: strOrNull(formData.get("no_hp")),
    tempatlahir: strOrNull(formData.get("tempatlahir")),
    tanggallahir: parseTanggal(formData.get("tanggallahir")) ?? null,
    sex: numOrNull(formData.get("sex")),
    gelar_depan: strOrNull(formData.get("gelar_depan")),
    gelar_belakang: strOrNull(formData.get("gelar_belakang")),
  });
  revalidatePath("/admin/info-desa/pemerintah");
  return { ok: true };
}

// ---- Profil Desa ----
export async function aksiSimpanProfil(items: Array<{ key: string; value: string; kategori: string; judul: string }>) {
  await simpanProfil({ items });
  revalidatePath("/admin/info-desa/status");
  return { ok: true };
}

// ---- Lembaga ----
export async function aksiTambahLembaga(formData: FormData) {
  await tambahLembaga({
    nama: str(formData.get("nama")),
    singkatan: str(formData.get("singkatan")) || undefined,
    ketua: str(formData.get("ketua")) || undefined,
    sekretaris: str(formData.get("sekretaris")) || undefined,
    alamat: str(formData.get("alamat")) || undefined,
    keterangan: str(formData.get("keterangan")) || undefined,
  });
  revalidatePath("/admin/info-desa/lembaga");
  return { ok: true };
}

export async function aksiHapusLembaga(id: number) {
  await hapusLembaga(id);
  revalidatePath("/admin/info-desa/lembaga");
  return { ok: true };
}

export async function aksiEditLembaga(formData: FormData) {
  const id = Number(formData.get("id"));
  await editLembaga({
    id,
    nama: String(formData.get("nama") ?? ""),
    singkatan: strOrNull(formData.get("singkatan")),
    ketua: strOrNull(formData.get("ketua")),
    sekretaris: strOrNull(formData.get("sekretaris")),
    alamat: strOrNull(formData.get("alamat")),
    keterangan: strOrNull(formData.get("keterangan")),
  });
  revalidatePath("/admin/info-desa/lembaga");
  return { ok: true };
}

// ---- Layanan Pelanggan ----
export async function aksiTambahLayanan(formData: FormData) {
  await tambahLayanan({
    nama: str(formData.get("nama")),
    kategori: str(formData.get("kategori")) || undefined,
    kontak: str(formData.get("kontak")) || undefined,
    url_form: str(formData.get("url_form")) || undefined,
    keterangan: str(formData.get("keterangan")) || undefined,
  });
  revalidatePath("/admin/info-desa/layanan");
  return { ok: true };
}

export async function aksiHapusLayanan(id: number) {
  await hapusLayanan(id);
  revalidatePath("/admin/info-desa/layanan");
  return { ok: true };
}

// ---- Kerjasama ----
export async function aksiTambahKerjasama(formData: FormData) {
  await tambahKerjasama({
    judul: str(formData.get("judul")),
    mitra: str(formData.get("mitra")),
    bidang: str(formData.get("bidang")) || undefined,
    tanggal_mulai: parseTanggal(formData.get("tanggal_mulai")),
    tanggal_selesai: parseTanggal(formData.get("tanggal_selesai")),
    nomor: str(formData.get("nomor")) || undefined,
    keterangan: str(formData.get("keterangan")) || undefined,
  });
  revalidatePath("/admin/info-desa/kerjasama");
  return { ok: true };
}

export async function aksiHapusKerjasama(id: number) {
  await hapusKerjasama(id);
  revalidatePath("/admin/info-desa/kerjasama");
  return { ok: true };
}
