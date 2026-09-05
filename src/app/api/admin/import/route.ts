// API route untuk upload Excel dari dasbor admin.
// POST /api/admin/import dengan multipart/form-data field "file".
// Response JSON berisi ringkasan import per-sheet.
//
// Autentikasi akan dipasang di langkah berikutnya. Untuk sekarang,
// route ini mengasumsikan admin sudah login.

import { NextRequest, NextResponse } from "next/server";
import {
  buatTemplateExcel,
  parseExcelFile,
  jalankanImport,
} from "@/modules/importer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  // Endpoint untuk download template kosong.
  const buffer = buatTemplateExcel();
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-surat-sid.xlsx"`,
    },
  });
}

export async function POST(req: NextRequest) {
  // 1. Ambil file dari form data
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Field 'file' wajib diisi (multipart/form-data)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 2. Parse
  const parsed = parseExcelFile(buffer);
  if (!parsed.berhasil) {
    return NextResponse.json(
      {
        ok: false,
        stage: "parse",
        errors: parsed.errors,
        summary: parsed.data.map((d) => ({ sheet: d.sheetKey, rows: d.baris.length })),
      },
      { status: 422 },
    );
  }

  if (parsed.data.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada sheet yang dikenali." },
      { status: 422 },
    );
  }

  // 3. Tulis ke DB
  try {
    const hasil = await jalankanImport(parsed.data);
    return NextResponse.json({
      ok: true,
      stage: "import",
      summary: parsed.data.map((d) => ({ sheet: d.sheetKey, rows: d.baris.length })),
      hasil,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "import", error: String(e) },
      { status: 500 },
    );
  }
}