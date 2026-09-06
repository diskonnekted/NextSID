// Seed template surat dari OpenSID.
// Membaca file template-surat-tinymce.json dari opensid-original
// dan menginsert semua 43 template ke database.
//
// Cara menjalankan: `npx tsx prisma/seed-surat.ts`

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TemplateRaw {
  nama: string;
  url_surat: string;
  kode_surat?: string;
  lampiran?: string | null;
  kunci?: boolean;
  favorit?: boolean;
  jenis: string;
  mandiri?: boolean;
  masa_berlaku?: number;
  satuan_masa_berlaku?: string;
  qr_code?: boolean | string;
  logo_garuda?: boolean;
  kecamatan?: string;
  syarat_surat?: string | null;
  template?: string;
  template_desa?: string | null;
  form_isian?: any;
  kode_isian?: any[];
  orientasi?: string;
  ukuran?: string;
  margin?: string;
  margin_global?: string;
  footer?: string | number;
  header?: string | number;
  format_nomor?: string | null;
}

async function main() {
  // Cari file template dari opensid-original
  // Script berada di prisma/seed-surat.ts, opensid-original di parent directory
  const cwd = process.cwd();
  const possiblePaths = [
    resolve(cwd, "../opensid-original/storage/app/template/impor/template-surat-tinymce.json"),
    resolve(cwd, "opensid-original/storage/app/template/impor/template-surat-tinymce.json"),
  ];

  let rawData: TemplateRaw[];
  let sourceFile = "";

  for (const p of possiblePaths) {
    try {
      const content = readFileSync(p, "utf-8");
      rawData = JSON.parse(content);
      sourceFile = p;
      break;
    } catch {
      continue;
    }
  }

  if (!rawData) {
    console.error("File template tidak ditemukan di path mana pun.");
    process.exit(1);
  }

  console.log(`Memuat ${rawData.length} template dari: ${sourceFile}`);

  // Ambil config_id pertama
  const config = await prisma.config.findFirst();
  if (!config) {
    console.error("Belum ada config desa. Jalankan seed.ts terlebih dahulu.");
    process.exit(1);
  }

  console.log(`Config: ${config.nama_desa} (id=${config.id})`);

  // Hapus template lama untuk config ini
  const deleted = await prisma.suratFormat.deleteMany({
    where: { config_id: config.id },
  });
  console.log(`Dihapus ${deleted.count} template lama.`);

  let inserted = 0;
  let skipped = 0;

  for (const t of rawData) {
    try {
      // Skip jika url_surat sudah ada
      const existing = await prisma.suratFormat.findUnique({
        where: {
          config_id_url_surat: {
            config_id: config.id,
            url_surat: t.url_surat,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Build form_isian JSON
      const form_isian = t.form_isian ? JSON.stringify(t.form_isian) : undefined;

      // Build kode_isian JSON
      const kode_isian = t.kode_isian ? JSON.stringify(t.kode_isian) : undefined;

      // Build margin JSON (stringify if already a string)
      const margin = t.margin ? (typeof t.margin === "string" ? t.margin : JSON.stringify(t.margin)) : undefined;

      // Boolean conversions
      const qr_code = (t.qr_code === true || t.qr_code === "1" || t.qr_code === "true") ? 1 : 0;
      const logo_garuda = (t.logo_garuda === true) ? 1 : 0;
      const kecamatan = (t.kecamatan === "1" || t.kecamatan === 1) ? 1 : 0;
      const mandiri = (t.mandiri === true || t.mandiri === "1" || t.mandiri === "true") ? 1 : 0;
      const kunci = (t.kunci === true) ? 1 : 0;
      const favorit = (t.favorit === true) ? 1 : 0;
      const jenis = parseInt(t.jenis, 10) || 2;
      const footer = (t.footer === "1" || t.footer === 1) ? 1 : 0;
      const header = (t.header === "1" || t.header === 1) ? 1 : 0;

      await prisma.suratFormat.create({
        data: {
          config_id: config.id,
          nama: t.nama,
          url_surat: t.url_surat,
          kode_surat: t.kode_surat || undefined,
          lampiran: t.lampiran || undefined,
          kunci,
          favorit,
          jenis,
          mandiri,
          masa_berlaku: t.masa_berlaku || undefined,
          satuan_masa_berlaku: t.satuan_masa_berlaku || undefined,
          qr_code,
          logo_garuda,
          kecamatan,
          template: t.template || undefined,
          template_desa: t.template_desa || undefined,
          form_isian,
          kode_isian,
          orientasi: t.orientasi || undefined,
          ukuran: t.ukuran || undefined,
          margin,
          footer,
          header,
          format_nomor: t.format_nomor || undefined,
        },
      });

      inserted++;
    } catch (err) {
      console.error(`Gagal insert "${t.nama}":`, err);
    }
  }

  console.log(`\nSelesai!`);
  console.log(`  Dimasukkan: ${inserted}`);
  console.log(`  Dilewati (sudah ada): ${skipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
