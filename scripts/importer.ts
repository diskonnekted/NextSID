#!/usr/bin/env tsx
// CLI import data dari Excel ke aplikasi Surat SID.
//
// Cara pakai:
//   npx tsx scripts/importer.ts ./data/openportid.xlsx
//   npx tsx scripts/importer.ts ./data/openportid.xlsx --dry-run
//   npx tsx scripts/importer.ts --template ./template-openportid.xlsx
//
// Output:
//   - Dry-run: tampilkan ringkasan tanpa menulis ke DB
//   - Import: tulis ke DB + tampilkan per-sheet summary

import * as fs from "node:fs";
import * as path from "node:path";
import { buatTemplateExcel, parseExcelFile, jalankanImport } from "../src/modules/importer";

async function main() {
  const args = process.argv.slice(2);

  const modeTemplate = args.includes("--template");
  const modeDryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => !a.startsWith("--"));

  if (modeTemplate) {
    const target = fileArg ?? "template-openportid.xlsx";
    const out = path.resolve(target);
    fs.writeFileSync(out, buatTemplateExcel());
    console.log(`✓ Template disimpan ke ${out}`);
    return;
  }

  if (!fileArg) {
    console.error("Error: tidak ada file Excel yang ditentukan.");
    console.error("");
    console.error("Penggunaan:");
    console.error("  tsx scripts/importer.ts <file.xlsx> [--dry-run]");
    console.error("  tsx scripts/importer.ts --template [output.xlsx]");
    process.exit(1);
  }

  const filepath = path.resolve(fileArg);
  if (!fs.existsSync(filepath)) {
    console.error(`Error: file tidak ditemukan: ${filepath}`);
    process.exit(1);
  }

  console.log(`📄 Membaca ${filepath} ...`);
  const buffer = fs.readFileSync(filepath);
  const parsed = parseExcelFile(buffer);

  if (!parsed.berhasil) {
    console.error(`\n⚠ Ditemukan ${parsed.errors.length} kesalahan parsing:\n`);
    for (const err of parsed.errors.slice(0, 20)) {
      console.error(`  [${err.sheetKey}] baris ${err.baris}, kolom ${err.kolom}: ${err.pesan}`);
    }
    if (parsed.errors.length > 20) {
      console.error(`  ... dan ${parsed.errors.length - 20} kesalahan lagi`);
    }
    console.error("\nPerbaiki file Excel dan coba lagi.");
    process.exit(2);
  }

  if (parsed.data.length === 0) {
    console.error("Error: tidak ada sheet yang dikenali di file Excel.");
    console.error("Pastikan ada sheet 'Identitas Desa', 'Kategori Artikel', 'Artikel', 'Pengguna', atau 'Media Sosial'.");
    process.exit(2);
  }

  console.log(`\n📊 Ringkasan:`);
  for (const sheet of parsed.data) {
    console.log(`   ${sheet.sheetKey.padEnd(20)} ${sheet.baris.length} baris`);
  }

  if (modeDryRun) {
    console.log(`\n✓ Dry-run selesai. Tidak ada perubahan ke database.`);
    console.log(`   Untuk benar-benar import, jalankan tanpa --dry-run`);
    return;
  }

  console.log(`\n💾 Menulis ke database ...`);
  const { prisma } = await import("../src/lib/prisma");
  const hasil = await jalankanImport(parsed.data);

  console.log(`\n📈 Hasil import:`);
  for (const r of hasil) {
    const status = r.errors.length === 0 ? "✓" : "⚠";
    console.log(
      `   ${status} ${r.sheetKey.padEnd(20)} +${r.inserted} baru, ~${r.updated} diubah, -${r.skipped} dilewati`,
    );
    if (r.errors.length > 0) {
      for (const e of r.errors.slice(0, 5)) {
        console.log(`       - ${e}`);
      }
      if (r.errors.length > 5) {
        console.log(`       ... dan ${r.errors.length - 5} error lagi`);
      }
    }
  }

  await prisma.$disconnect();
  console.log(`\n✓ Selesai.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});