// Utilitas upload file ke folder public/uploads/.
// Dipakai untuk logo desa, gambar artikel, dsb.
// Hanya jalan di server (server action / route handler).

import { promises as fs } from "node:fs";
import path from "node:path";

export type JenisUpload = "logo" | "kantor" | "hero" | "artikel" | "galeri";

const JENIS_KE_SUBDIR: Record<JenisUpload, string> = {
  logo: "desa",
  kantor: "desa",
  hero: "desa",
  artikel: "artikel",
  galeri: "galeri",
};

const EKSTENSI_DIIZINKAN: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

const UKURAN_MAKS_BYTES = 2 * 1024 * 1024; // 2 MB

export type HasilUpload = {
  ok: boolean;
  pesan?: string;
  path?: string; // path publik, mis. "/uploads/desa/logo-123456.jpg"
};

export async function simpanFileUpload(
  file: File,
  jenis: JenisUpload,
): Promise<HasilUpload> {
  if (!file || typeof file === "string" || file.size === 0) {
    return { ok: false, pesan: "File kosong" };
  }
  if (file.size > UKURAN_MAKS_BYTES) {
    return { ok: false, pesan: "Ukuran file melebihi 2 MB" };
  }
  const ext = EKSTENSI_DIIZINKAN[file.type];
  if (!ext) {
    return {
      ok: false,
      pesan: `Tipe file tidak didukung: ${file.type || "unknown"}. Gunakan JPG/PNG/WebP/SVG.`,
    };
  }

  const subdir = JENIS_KE_SUBDIR[jenis];
  const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(uploadDir, { recursive: true });

  const slugBase = (file.name || "file")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "file";

  const namaFile = `${slugBase}-${Date.now()}.${ext}`;
  const fullPath = path.join(uploadDir, namaFile);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);

  return {
    ok: true,
    path: `/uploads/${subdir}/${namaFile}`,
  };
}

export async function hapusFileUpload(pathPublik: string): Promise<boolean> {
  if (!pathPublik) return false;
  if (!pathPublik.startsWith("/uploads/")) return false;
  const nama = pathPublik.replace(/^\/uploads\//, "");
  if (nama.includes("..")) return false;
  const fullPath = path.join(process.cwd(), "public", "uploads", nama);
  try {
    await fs.unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}