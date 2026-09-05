// GET /api/admin/kependudukan/ref
// Mengembalikan daftar referensi (agama, pekerjaan, status kawin, dll.)
// untuk pilihan dropdown di form penduduk.

import { NextResponse } from "next/server";
import { ambilReferensiPenduduk } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET() {
  const data = await ambilReferensiPenduduk();
  return NextResponse.json({ ok: true, data });
}