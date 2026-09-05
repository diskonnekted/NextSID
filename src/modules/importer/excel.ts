// Pembuat template Excel (download dari dasbor admin atau CLI).
// Output: Workbook dengan banyak sheet, baris header, dan contoh baris.
//
// Pakai:
//   import { buatTemplateExcel } from "@/modules/importer/excel";
//   const buffer = buatTemplateExcel(); // Buffer
//
// Atau untuk satu sheet tertentu:
//   buatTemplateExcel(["artikel", "kategori"])

import * as XLSX from "xlsx";
import { templateSheets, SheetTemplate } from "./template";

const NILAI_BENAR = new Set(["1", "true", "ya", "y", "yes"]);
const NILAI_SALAH = new Set(["0", "false", "tidak", "n", "no", ""]);

function bool(v: unknown): string {
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return v ? "1" : "0";
  const s = String(v ?? "").toLowerCase().trim();
  if (NILAI_BENAR.has(s)) return "1";
  if (NILAI_SALAH.has(s)) return "0";
  return "0";
}

export function buatTemplateExcel(keys?: string[]): Buffer {
  const sheets: SheetTemplate[] = keys
    ? templateSheets.filter((s) => keys.includes(s.key))
    : templateSheets;

  const wb = XLSX.utils.book_new();

  // Sheet instruksi di paling depan.
  const instruksiData = [
    ["Petunjuk Import Data OpenSID"],
    [""],
    ["Setiap sheet mewakili satu tabel database."],
    ["Baris pertama adalah header, jangan diubah."],
    ["Baris kedua adalah contoh. Hapus atau timpa sebelum import."],
    [""],
    ["Urutan import yang disarankan:"],
    ["  1. config          — identitas desa"],
    ["  2. user            — akun dasbor"],
    ["  3. kategori        — kategori artikel"],
    ["  4. artikel         — artikel/berita"],
    ["  5. media_sosial    — tautan sosmed"],
    ["  6. kode_data       — referensi master (agama, pekerjaan, dll)"],
    ["  7. keluarga        — kartu keluarga"],
    ["  8. penduduk        — data penduduk per KK"],
    [""],
    ["Catatan:"],
    ["  - Kolom bertanda 'wajib' harus diisi."],
    ["  - Kolom bertanda 'Otomatis' akan diisi sistem bila kosong."],
    ["  - Untuk tanggal, format yang diterima: YYYY-MM-DD atau YYYY-MM-DD HH:mm:ss."],
  ];
  const wsInstruksi = XLSX.utils.aoa_to_sheet(instruksiData);
  wsInstruksi["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInstruksi, "Petunjuk");

  for (const sheet of sheets) {
    const header = sheet.kolom.map((k) => k.judul);
    const contoh = sheet.kolom.map((k) => k.contoh ?? "");
    const aoa: (string | number)[][] = [header, contoh];

    // Tambahkan catatan wajib di kolom A baris 4
    if (sheet.deskripsi) {
      const catatan = sheet.kolom.map((k, i) =>
        i === 0 ? `Catatan: ${sheet.deskripsi}` : "",
      );
      aoa.push(catatan);
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Lebar kolom proporsional dengan panjang header
    ws["!cols"] = sheet.kolom.map((k) => ({
      wch: Math.min(40, Math.max(15, k.judul.length + 4)),
    }));

    XLSX.utils.book_append_sheet(wb, ws, sheet.judul.slice(0, 31));
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}