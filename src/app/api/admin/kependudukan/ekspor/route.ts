// GET /api/admin/kependudukan/ekspor
// Download seluruh data kependudukan desa dalam format Excel
// (sheet "Data Penduduk" + "Kode Data") — kompatibel dengan format
// import utama (format-impor-excel.xlsm).

import { NextResponse } from "next/server";
import { eksporPendudukExcel } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET() {
  const { buffer, totalPenduduk, totalKK } = await eksporPendudukExcel();
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="kependudukan-${stamp}.xlsx"`,
      "X-Total-Penduduk": String(totalPenduduk),
      "X-Total-KK": String(totalKK),
    },
  });
}