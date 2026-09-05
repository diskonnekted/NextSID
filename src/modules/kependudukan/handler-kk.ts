// Server actions untuk CRUD Kartu Keluarga + anggota Penduduk.
// Dipanggil dari client component dengan useTransition.

"use server";

import { revalidatePath } from "next/cache";
import {
  buatKKBaru,
  editKK,
  hapusKK,
  tambahAnggota,
  editAnggota,
  hapusAnggota,
} from "./index";

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function numOrNull(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function parseTanggal(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function ambilRef<T = string>(v: unknown): T | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  return v as T;
}

// ---------- KK ----------

export async function aksiBuatKK(formData: FormData) {
  const args = {
    no_kk: str(formData.get("no_kk")),
    alamat: ambilRef(formData.get("alamat")) ?? null,
    dusun: ambilRef(formData.get("dusun")) ?? null,
    rw: ambilRef(formData.get("rw")) ?? null,
    rt: ambilRef(formData.get("rt")) ?? null,
    kepala: {
      nik: str(formData.get("kepala_nik")),
      nama: str(formData.get("kepala_nama")),
      sex: numOrNull(formData.get("kepala_sex")),
      tempatlahir: ambilRef(formData.get("kepala_tempatlahir")) ?? null,
      tanggallahir: parseTanggal(formData.get("kepala_tanggallahir")) ?? null,
      agama_id: numOrNull(formData.get("kepala_agama_id")),
      pekerjaan_id: numOrNull(formData.get("kepala_pekerjaan_id")),
      status_kawin: numOrNull(formData.get("kepala_status_kawin")),
      pendidikan_kk_id: numOrNull(formData.get("kepala_pendidikan_id")),
      warganegara_id: numOrNull(formData.get("kepala_warganegara_id")),
      golongan_darah_id: numOrNull(formData.get("kepala_golongan_darah_id")),
    },
  };
  const result = await buatKKBaru(args);
  revalidatePath("/admin/kk");
  revalidatePath(`/admin/kependudukan/kk/${result.no_kk}`);
  revalidatePath("/admin/kependudukan");
  return { ok: true, no_kk: result.no_kk };
}

export async function aksiEditKK(formData: FormData) {
  await editKK({
    no_kk: str(formData.get("no_kk")),
    alamat: ambilRef(formData.get("alamat")) ?? null,
    dusun: ambilRef(formData.get("dusun")) ?? null,
    rw: ambilRef(formData.get("rw")) ?? null,
    rt: ambilRef(formData.get("rt")) ?? null,
  });
  revalidatePath("/admin/kk");
  revalidatePath(`/admin/kependudukan/kk/${str(formData.get("no_kk"))}`);
  return { ok: true };
}

export async function aksiHapusKK(no_kk: string) {
  await hapusKK(no_kk);
  revalidatePath("/admin/kk");
  revalidatePath("/admin/kependudukan");
  return { ok: true };
}

// ---------- Anggota ----------

export async function aksiTambahAnggota(formData: FormData) {
  const result = await tambahAnggota({
    no_kk: str(formData.get("no_kk")),
    nik: str(formData.get("nik")),
    nama: str(formData.get("nama")),
    sex: numOrNull(formData.get("sex")),
    tempatlahir: ambilRef(formData.get("tempatlahir")) ?? null,
    tanggallahir: parseTanggal(formData.get("tanggallahir")) ?? null,
    kk_level: numOrNull(formData.get("kk_level")),
    agama_id: numOrNull(formData.get("agama_id")),
    pekerjaan_id: numOrNull(formData.get("pekerjaan_id")),
    status_kawin: numOrNull(formData.get("status_kawin")),
    pendidikan_kk_id: numOrNull(formData.get("pendidikan_id")),
    warganegara_id: numOrNull(formData.get("warganegara_id")),
    golongan_darah_id: numOrNull(formData.get("golongan_darah_id")),
  });
  revalidatePath(`/admin/kependudukan/kk/${str(formData.get("no_kk"))}`);
  revalidatePath("/admin/kependudukan");
  return { ok: true, nik: result.nik };
}

export async function aksiEditAnggota(formData: FormData) {
  // Untuk form edit: dropdown opsional dengan value "" berarti "tidak diubah".
  // Pakai parseEdit() yang mengembalikan undefined untuk string kosong
  // sehingga editAnggota tidak akan null field existing.
  const parseEditNum = (v: FormDataEntryValue | null): number | null | undefined => {
    if (v == null) return undefined;
    const s = String(v).trim();
    if (s === "") return undefined;
    const n = Number(s);
    return isNaN(n) ? undefined : n;
  };
  const parseEditStr = (v: FormDataEntryValue | null): string | null | undefined => {
    if (v == null) return undefined;
    const s = String(v);
    return s === "" ? undefined : s;
  };
  await editAnggota({
    nikAsal: str(formData.get("nikAsal")),
    no_kk: str(formData.get("no_kk")),
    nik: str(formData.get("nik")),
    nama: str(formData.get("nama")),
    sex: parseEditNum(formData.get("sex")),
    tempatlahir: parseEditStr(formData.get("tempatlahir")),
    tanggallahir: parseTanggal(formData.get("tanggallahir")),
    kk_level: parseEditNum(formData.get("kk_level")),
    agama_id: parseEditNum(formData.get("agama_id")),
    pekerjaan_id: parseEditNum(formData.get("pekerjaan_id")),
    status_kawin: parseEditNum(formData.get("status_kawin")),
    pendidikan_kk_id: parseEditNum(formData.get("pendidikan_id")),
    warganegara_id: parseEditNum(formData.get("warganegara_id")),
    golongan_darah_id: parseEditNum(formData.get("golongan_darah_id")),
  });
  revalidatePath(`/admin/kependudukan/kk/${str(formData.get("no_kk"))}`);
  revalidatePath("/admin/kependudukan");
  return { ok: true };
}

export async function aksiHapusAnggota(formData: FormData) {
  const no_kk = str(formData.get("no_kk"));
  const nik = str(formData.get("nik"));
  await hapusAnggota(nik);
  revalidatePath(`/admin/kependudukan/kk/${no_kk}`);
  revalidatePath("/admin/kependudukan");
  return { ok: true };
}