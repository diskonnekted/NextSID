// Handler import — menulis baris hasil parse ke database.
//
// Urutan import:
//   1. config       — identitas desa (wajib sebelum sheet lain)
//   2. user         — user dasbor (diperlukan oleh artikel sebagai author)
//   3. kategori     — kategori (diperlukan oleh artikel)
//   4. artikel      — artikel
//   5. media_sosial — tidak butuh dependency.

import { prisma } from "@/lib/prisma";
import { HasilParse, BarisImport } from "./parser";

export type ImporterResult = {
  sheetKey: string;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};

function asString(v: unknown, fallback = ""): string {
  return v == null ? fallback : String(v);
}

function asInt(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(v: unknown): boolean {
  if (v === 1 || v === true || v === "1" || v === "true") return true;
  return false;
}

function asDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string" && v.trim()) {
    const d = new Date(v.replace(" ", "T"));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// ============================================================
// Handler: config
// ============================================================
async function handleConfig(baris: BarisImport[]): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "config",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  // Ambil baris pertama yang valid
  const row = baris.find((r) => r.nama_desa);
  if (!row) {
    result.skipped = baris.length;
    return result;
  }
  try {
    const existing = await prisma.config.findFirst({ orderBy: { id: "asc" } });
    const data = {
      nama_desa: asString(row.nama_desa),
      kode_desa: asString(row.kode_desa) || null,
      kode_pos: asString(row.kode_pos) || null,
      alamat: asString(row.alamat) || null,
      email: asString(row.email) || null,
      telepon: asString(row.telepon) || null,
      website: asString(row.website) || null,
      nama_kecamatan: asString(row.nama_kecamatan) || null,
      nama_kabupaten: asString(row.nama_kabupaten) || null,
      nama_propinsi: asString(row.nama_propinsi) || null,
      lat: asString(row.lat) || null,
      lng: asString(row.lng) || null,
    };
    if (existing) {
      await prisma.config.update({ where: { id: existing.id }, data });
      result.updated = 1;
    } else {
      await prisma.config.create({ data });
      result.inserted = 1;
    }
  } catch (e) {
    result.errors.push(String(e));
  }
  result.skipped = baris.length > 1 ? baris.length - 1 : 0;
  return result;
}

// ============================================================
// Handler: user
// ============================================================
async function handleUser(baris: BarisImport[]): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "user",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id;

  for (const row of baris) {
    if (!row.username || !row.nama) {
      result.skipped++;
      continue;
    }
    try {
      const data = {
        config_id: configId ?? null,
        username: asString(row.username),
        password: asString(row.password) || "placeholder",
        nama: asString(row.nama),
        email: asString(row.email) || null,
        phone: asString(row.phone) || null,
        id_grup: asInt(row.id_grup, 0) || null,
        active: asInt(row.active, 1),
      };
      const existing = await prisma.user.findUnique({
        where: { username: asString(row.username) },
      });
      if (existing) {
        await prisma.user.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.user.create({ data });
        result.inserted++;
      }
    } catch (e) {
      result.errors.push(`Baris ${row.username}: ${e}`);
    }
  }
  return result;
}

// ============================================================
// Handler: kategori
// ============================================================
async function handleKategori(baris: BarisImport[]): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "kategori",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id;

  // Insert parent dulu (parent_slug null/empty), lalu child.
  const sorted = [...baris].sort((a, b) => {
    const aParent = a.parent_slug ? 1 : 0;
    const bParent = b.parent_slug ? 1 : 0;
    return aParent - bParent;
  });

  for (const row of sorted) {
    if (!row.kategori) {
      result.skipped++;
      continue;
    }
    try {
      const slug = asString(row.slug) || null;
      let parentId: number | null = null;
      if (row.parent_slug) {
        const parent = await prisma.kategori.findFirst({
          where: { slug: asString(row.parent_slug) },
        });
        parentId = parent?.id ?? null;
      }

      const data = {
        config_id: configId ?? null,
        kategori: asString(row.kategori),
        slug,
        parent_id: parentId,
        tipe: asInt(row.tipe, 1),
        urut: asInt(row.urut, 0),
        enabled: asInt(row.enabled, 1),
      };

      const existing = slug
        ? await prisma.kategori.findFirst({ where: { slug } })
        : null;
      if (existing) {
        await prisma.kategori.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.kategori.create({ data });
        result.inserted++;
      }
    } catch (e) {
      result.errors.push(`Baris ${row.kategori}: ${e}`);
    }
  }
  return result;
}

// ============================================================
// Handler: artikel
// ============================================================
async function handleArtikel(baris: BarisImport[]): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "artikel",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id;

  for (const row of baris) {
    if (!row.judul) {
      result.skipped++;
      continue;
    }
    try {
      let kategoriId: number | null = null;
      if (row.kategori_slug) {
        const k = await prisma.kategori.findFirst({
          where: { slug: asString(row.kategori_slug) },
        });
        kategoriId = k?.id ?? null;
      }

      let authorId: number | null = null;
      if (row.author_username) {
        const u = await prisma.user.findUnique({
          where: { username: asString(row.author_username) },
        });
        authorId = u?.id ?? null;
      }

      const tgl = asDate(row.tgl_upload) ?? new Date();
      const slug = asString(row.slug) || null;

      const data = {
        config_id: configId ?? null,
        judul: asString(row.judul),
        slug,
        isi: asString(row.isi),
        gambar: asString(row.gambar) || null,
        gambar1: asString(row.gambar1) || null,
        gambar2: asString(row.gambar2) || null,
        gambar3: asString(row.gambar3) || null,
        tgl_upload: tgl,
        enabled: asInt(row.enabled, 1),
        headline: asInt(row.headline, 0),
        slider: asInt(row.slider, 0),
        tipe: asString(row.tipe, "dinamis"),
        id_kategori: kategoriId,
        id_user: authorId,
        boleh_komentar: asInt(row.boleh_komentar, 1),
      };

      const existing = slug
        ? await prisma.artikel.findFirst({ where: { slug } })
        : null;
      if (existing) {
        await prisma.artikel.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.artikel.create({ data });
        result.inserted++;
      }
    } catch (e) {
      result.errors.push(`Baris ${row.judul}: ${e}`);
    }
  }
  return result;
}

// ============================================================
// Handler: media_sosial
// ============================================================
async function handleMediaSosial(baris: BarisImport[]): Promise<ImporterResult> {
  const result: ImporterResult = {
    sheetKey: "media_sosial",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const config = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const configId = config?.id;

  for (const row of baris) {
    if (!row.nama || !row.url) {
      result.skipped++;
      continue;
    }
    try {
      const data = {
        config_id: configId ?? null,
        nama: asString(row.nama),
        url: asString(row.url),
        ikon: asString(row.ikon) || "",
        enabled: asInt(row.enabled, 1),
      };
      await prisma.mediaSosial.create({ data });
      result.inserted++;
    } catch (e) {
      result.errors.push(`Baris ${row.nama}: ${e}`);
    }
  }
  return result;
}

// ============================================================
// Urutan import & dispatcher
// ============================================================
const handlers: Record<string, (baris: BarisImport[]) => Promise<ImporterResult>> = {
  config: handleConfig,
  user: handleUser,
  kategori: handleKategori,
  artikel: handleArtikel,
  media_sosial: handleMediaSosial,
};

export async function jalankanImport(data: HasilParse[]): Promise<ImporterResult[]> {
  const urutan = ["config", "user", "kategori", "artikel", "media_sosial"];
  const hasil: ImporterResult[] = [];

  for (const sheetKey of urutan) {
    const sheetData = data.find((d) => d.sheetKey === sheetKey);
    if (!sheetData || sheetData.baris.length === 0) continue;
    const handler = handlers[sheetKey];
    if (!handler) continue;
    const res = await handler(sheetData.baris);
    hasil.push(res);
  }

  return hasil;
}