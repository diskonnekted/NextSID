// Server actions untuk module konfigurasi.
// Dipanggil dari client component via useTransition.

"use server";

import { revalidatePath } from "next/cache";
import {
  simpanKonfigurasi,
  simpanLogo,
  hapusLogo,
  simpanFotoKantor,
  simpanHeroBanner,
  hapusHeroBanner,
  simpanBanyakSetting,
  hapusSetting,
} from "./index";
import { simpanFileUpload, hapusFileUpload } from "@/lib/upload";

function str(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

// =====================================================================
// Konfigurasi umum (tema, border, app_key)
// =====================================================================

export async function aksiSimpanKonfigurasi(formData: FormData) {
  await simpanKonfigurasi({
    warna: str(formData.get("warna")) || undefined,
    border: str(formData.get("border")) || undefined,
    app_key: str(formData.get("app_key")) || undefined,
  });
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true };
}

// =====================================================================
// Upload / hapus logo desa
// =====================================================================

export async function aksiUploadLogo(formData: FormData) {
  const file = formData.get("logo");
  if (!(file instanceof File)) {
    return { ok: false, pesan: "File tidak ditemukan" };
  }
  const hasil = await simpanFileUpload(file, "logo");
  if (!hasil.ok) return hasil;

  // Hapus file lama jika ada
  const lama = str(formData.get("logo_lama"));
  if (lama) await hapusFileUpload(lama);

  await simpanLogo(hasil.path!);
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true, path: hasil.path };
}

export async function aksiHapusLogo() {
  await hapusLogo();
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true };
}

// =====================================================================
// Upload foto kantor desa
// =====================================================================

export async function aksiUploadFotoKantor(formData: FormData) {
  const file = formData.get("kantor");
  if (!(file instanceof File)) {
    return { ok: false, pesan: "File tidak ditemukan" };
  }
  const hasil = await simpanFileUpload(file, "kantor");
  if (!hasil.ok) return hasil;

  const lama = str(formData.get("kantor_lama"));
  if (lama) await hapusFileUpload(lama);

  await simpanFotoKantor(hasil.path!);
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true, path: hasil.path };
}

// =====================================================================
// Upload hero banner landing page
// =====================================================================

export async function aksiUploadHeroBanner(formData: FormData) {
  const file = formData.get("hero");
  if (!(file instanceof File)) {
    return { ok: false, pesan: "File tidak ditemukan" };
  }
  const hasil = await simpanFileUpload(file, "hero");
  if (!hasil.ok) return hasil;

  const lama = str(formData.get("hero_lama"));
  if (lama) await hapusFileUpload(lama);

  await simpanHeroBanner(hasil.path!);
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true, path: hasil.path };
}

export async function aksiHapusHeroBanner() {
  await hapusHeroBanner();
  revalidatePath("/admin/konfigurasi");
  revalidatePath("/", "layout");
  return { ok: true };
}

// =====================================================================
// Setting key-value
// =====================================================================

export async function aksiSimpanSetting(formData: FormData) {
  const items: Array<{ key: string; value: string }> = [];
  // Iterasi semua entries ber-prefix "setting_"
  for (const [name, val] of formData.entries()) {
    if (!name.startsWith("setting_")) continue;
    const key = name.slice("setting_".length).trim();
    if (!key) continue;
    items.push({ key, value: str(val) });
  }
  await simpanBanyakSetting(items);
  revalidatePath("/admin/konfigurasi");
  return { ok: true, jumlah: items.length };
}

export async function aksiHapusSettingItem(key: string) {
  await hapusSetting(key);
  revalidatePath("/admin/konfigurasi");
  return { ok: true };
}