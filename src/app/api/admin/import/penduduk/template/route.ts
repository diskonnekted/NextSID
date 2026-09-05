// Download template khusus kependudukan.
// GET /api/admin/import/penduduk/template
// Mengembalikan workbook berisi sheet Petunjuk + Kartu Keluarga +
// Data Penduduk + Kode Data (header + 1 baris contoh).

import { NextResponse } from "next/server";
import { buatTemplateExcel } from "@/modules/importer";

export const runtime = "nodejs";

export async function GET() {
  const buffer = buatTemplateExcel(["keluarga", "penduduk", "kode_data"]);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-kependudukan.xlsx"`,
    },
  });
}