// Parser Excel untuk import.
// Membaca file .xlsx dan mengkonversi setiap sheet menjadi baris-baris
// bertipe sesuai definisi template.

import * as XLSX from "xlsx";
import { templateSheets, SheetTemplate, KolomTemplate } from "./template";
import { bersihkanSlug } from "@/lib/settings";

export type BarisImport = Record<string, unknown>;

export type HasilParse = {
  sheetKey: string;
  baris: BarisImport[];
};

export type ParseError = {
  sheetKey: string;
  baris: number;
  kolom: string;
  pesan: string;
};

export type ParseResult = {
  berhasil: boolean;
  data: HasilParse[];
  errors: ParseError[];
};

const NILAI_BENAR = new Set(["1", "true", "ya", "y", "yes"]);
const NILAI_SALAH = new Set(["0", "false", "tidak", "n", "no", ""]);

function konversiBool(v: unknown): boolean | null {
  if (v === true || v === false) return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v ?? "").toLowerCase().trim();
  if (NILAI_BENAR.has(s)) return true;
  if (NILAI_SALAH.has(s)) return false;
  return null;
}

function konversiTipe(
  value: unknown,
  kolom: KolomTemplate,
): { value: unknown; error?: string } {
  if (value === undefined || value === null || value === "") {
    if (kolom.wajib) {
      return { value: null, error: "Kolom wajib diisi" };
    }
    return { value: null };
  }

  switch (kolom.tipe) {
    case "string":
    case "text-long":
      return { value: String(value).trim() };

    case "integer": {
      const n = typeof value === "number" ? value : parseInt(String(value), 10);
      return Number.isFinite(n)
        ? { value: n }
        : { value: null, error: "Bukan bilangan bulat" };
    }

    case "number": {
      const n = typeof value === "number" ? value : parseFloat(String(value));
      return Number.isFinite(n)
        ? { value: n }
        : { value: null, error: "Bukan bilangan" };
    }

    case "boolean": {
      const b = konversiBool(value);
      if (b === null) {
        return { value: null, error: "Gunakan 1/0 atau ya/tidak" };
      }
      return { value: b ? 1 : 0 };
    }

    case "date":
    case "datetime": {
      // Terima Excel serial number atau string.
      if (typeof value === "number") {
        const d = XLSX.SSF.parse_date_code(value);
        if (!d) return { value: null, error: "Tanggal tidak valid" };
        const iso = new Date(Date.UTC(d.y, d.m - 1, d.d, d.H ?? 0, d.M ?? 0, d.S ?? 0));
        return { value: iso };
      }
      const str = String(value).trim();
      // Coba ISO dulu, lalu format OpenSID "YYYY-MM-DD HH:mm:ss".
      const coba1 = new Date(str);
      if (!isNaN(coba1.getTime())) return { value: coba1 };
      const coba2 = str.replace(" ", "T");
      const coba3 = new Date(coba2);
      if (!isNaN(coba3.getTime())) return { value: coba3 };
      return { value: null, error: "Tanggal tidak valid" };
    }

    case "enum": {
      const s = String(value).trim();
      if (!kolom.nilaiEnum || kolom.nilaiEnum.includes(s)) {
        return { value: s };
      }
      return { value: null, error: `Harus salah satu: ${kolom.nilaiEnum.join(", ")}` };
    }

    default:
      return { value };
  }
}

function cariSheetByJudul(wb: XLSX.WorkBook, judul: string): string | null {
  const target = judul.toLowerCase().replace(/\s+/g, "");
  for (const name of wb.SheetNames) {
    if (name.toLowerCase().replace(/\s+/g, "") === target) return name;
  }
  return null;
}

// Cocokkan sheet by signature kolom header. Mengembalikan MAP
// sheetName → skor tertinggi (jumlah kolom cocok). Dipakai setelah
// semua template dievaluasi, sehingga template yang lebih spesifik
// (mis. penduduk 43 kolom) menang atas yang generik (media_sosial
// "nama" saja).
function kumpulkanSignature(
  wb: XLSX.WorkBook,
  template: SheetTemplate,
  terpakai: Set<string>,
): { sheetName: string; skor: number } | null {
  const wajib = template.kolom.filter((k) => k.wajib).map((k) => k.judul.toLowerCase());
  const semua = template.kolom.map((k) => k.judul.toLowerCase());
  if (semua.length === 0) return null;
  let best: { sheetName: string; skor: number } | null = null;
  for (const name of wb.SheetNames) {
    if (terpakai.has(name)) continue;
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      raw: true,
      defval: null,
    });
    if (aoa.length === 0) continue;
    // Cek 3 baris pertama
    for (let i = 0; i < Math.min(aoa.length, 3); i++) {
      const row = (aoa[i] ?? []).map((c) =>
        typeof c === "string" ? c.trim().toLowerCase() : "",
      );
      // Wajib harus match semua
      if (wajib.length > 0) {
        const wajibMatch = wajib.filter((w) => row.includes(w)).length;
        if (wajibMatch < wajib.length) continue;
      }
      const totalMatch = semua.filter((s) => row.includes(s)).length;
      // Minimal 3 kolom cocok supaya tidak false-positive pada kolom generik
      if (totalMatch < 3) continue;
      if (!best || totalMatch > best.skor) {
        best = { sheetName: name, skor: totalMatch };
      }
    }
  }
  return best;
}

function autoSlug(value: string): string {
  return bersihkanSlug(value);
}

export function parseExcelFile(buffer: Buffer | Uint8Array): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const data: HasilParse[] = [];
  const errors: ParseError[] = [];
  // Sheet yang sudah dipakai template lain (untuk mencegah double-match).
  const terpakai = new Set<string>();

  // Tahap 1: tentukan sheet mana yang dipakai template mana.
  // Urutan: template dengan signature match paling spesifik (skor
  // tertinggi) mendapat sheet lebih dulu.
  type Slot = { template: SheetTemplate; sheetName: string | null; byJudul: boolean };
  const slots: Slot[] = templateSheets.map((template) => {
    const byJudul =
      cariSheetByJudul(wb, template.judul) ?? cariSheetByJudul(wb, template.key);
    return { template, sheetName: byJudul, byJudul: !!byJudul };
  });
  // Untuk template yang tidak punya byJudul, scan signature. Pakai skor
  // sebagai tie-breaker: yang skor tertinggi di-assign duluan.
  const candidatos = slots
    .filter((s) => !s.sheetName)
    .map((s) => ({ slot: s, sig: kumpulkanSignature(wb, s.template, terpakai) }))
    .filter((c) => c.sig !== null)
    .sort((a, b) => (b.sig!.skor - a.sig!.skor));
  for (const { slot, sig } of candidatos) {
    if (terpakai.has(sig!.sheetName)) continue;
    slot.sheetName = sig!.sheetName;
    terpakai.add(sig!.sheetName);
  }
  // Tandai juga sheet byJudul yang sudah terpakai
  for (const s of slots) {
    if (s.sheetName) terpakai.add(s.sheetName);
  }

  for (const slot of slots) {
    const template = slot.template;
    const namaSheet = slot.sheetName;
    if (!namaSheet) continue;

    const ws = wb.Sheets[namaSheet];
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      raw: true,
      defval: null,
    });

    if (aoa.length === 0) continue;

    // Cari baris header: baris dengan jumlah cell non-null >= jumlah kolom template.
    let headerRowIdx = -1;
    let columnMap: Record<string, number> = {};
    for (let i = 0; i < Math.min(aoa.length, 5); i++) {
      const row = aoa[i] ?? [];
      const map: Record<string, number> = {};
      let matched = 0;
      for (const k of template.kolom) {
        const idx = row.findIndex(
          (cell) =>
            typeof cell === "string" &&
            cell.trim().toLowerCase() === k.judul.toLowerCase(),
        );
        if (idx >= 0) {
          map[k.key] = idx;
          matched++;
        }
      }
      if (matched > 0 && matched > headerRowIdx) {
        headerRowIdx = i;
        columnMap = map;
      }
    }

    if (headerRowIdx < 0) {
      errors.push({
        sheetKey: template.key,
        baris: 0,
        kolom: "-",
        pesan: `Header tidak ditemukan di sheet "${namaSheet}". Pastikan ada kolom: ${template.kolom.map((k) => k.judul).join(", ")}.`,
      });
      continue;
    }

    const baris: BarisImport[] = [];

    for (let r = headerRowIdx + 1; r < aoa.length; r++) {
      const row = aoa[r] ?? [];
      // Skip baris kosong
      if (row.every((c) => c === null || c === "" || c === undefined)) continue;
      // Skip baris catatan (dimulai dengan "Catatan:")
      const firstCell = String(row[0] ?? "").trim();
      if (firstCell.startsWith("Catatan:")) continue;

      const hasil: BarisImport = {};

      for (const kolom of template.kolom) {
        const colIdx = columnMap[kolom.key];
        if (colIdx === undefined) {
          if (kolom.wajib) {
            errors.push({
              sheetKey: template.key,
              baris: r + 1,
              kolom: kolom.judul,
              pesan: "Kolom tidak ada di header",
            });
          }
          continue;
        }
        const raw = row[colIdx];
        const { value: converted, error } = konversiTipe(raw, kolom);
        if (error) {
          errors.push({
            sheetKey: template.key,
            baris: r + 1,
            kolom: kolom.judul,
            pesan: error,
          });
          continue;
        }
        hasil[kolom.key] = converted;
      }

      // Auto-slug untuk artikel/kategori bila slug kosong
      if (template.key === "artikel" && !hasil.slug && hasil.judul) {
        hasil.slug = autoSlug(String(hasil.judul));
      }
      if (template.key === "kategori" && !hasil.slug && hasil.kategori) {
        hasil.slug = autoSlug(String(hasil.kategori));
      }

      baris.push(hasil);
    }

    if (baris.length > 0) {
      data.push({ sheetKey: template.key, baris });
    }
  }

  return {
    berhasil: errors.length === 0,
    data,
    errors,
  };
}