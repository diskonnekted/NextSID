// API route import penduduk dari Excel.
// POST /api/admin/import/penduduk dengan multipart/form-data field "file".
// Mendukung sheet: Kode Data, Kartu Keluarga, Data Penduduk.
// File harus sesuai kontrak format-impor-excel.xlsm (43 kolom + kode data).
//
// Response JSON berisi ringkasan per-sheet (inserted/updated/skipped/errors).

import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile } from "@/modules/importer";
import { importKependudukan } from "@/modules/kependudukan";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Field 'file' wajib diisi (multipart/form-data)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Parse seluruh workbook
  const parsed = parseExcelFile(buffer);
  if (parsed.data.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        stage: "parse",
        error:
          "Tidak ada sheet kependudukan yang dikenali. Pastikan workbook punya sheet: 'Kode Data', 'Kartu Keluarga', dan/atau 'Data Penduduk'.",
      },
      { status: 422 },
    );
  }

  // Filter hanya sheet kependudukan
  const KEYS = new Set(["kode_data", "keluarga", "penduduk"]);
  const filtered = parsed.data.filter((d) => KEYS.has(d.sheetKey));
  if (filtered.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        stage: "parse",
        error: "Sheet yang dikenali bukan sheet kependudukan.",
        recognized: parsed.data.map((d) => d.sheetKey),
      },
      { status: 422 },
    );
  }

  // 2. Impor ke DB
  try {
    const hasil = await importKependudukan(filtered);
    const totalInserted = hasil.reduce((s, h) => s + h.inserted, 0);
    const totalUpdated = hasil.reduce((s, h) => s + h.updated, 0);
    const totalSkipped = hasil.reduce((s, h) => s + h.skipped, 0);
    const allErrors = hasil.flatMap((h) => h.errors);

    return NextResponse.json({
      ok: allErrors.length === 0,
      stage: "import",
      recognized: filtered.map((d) => ({ sheet: d.sheetKey, rows: d.baris.length })),
      totalInserted,
      totalUpdated,
      totalSkipped,
      errors: allErrors.slice(0, 50),
      hasil,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "import", error: String(e) },
      { status: 500 },
    );
  }
}