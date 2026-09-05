// GET /api/admin/kependudukan/statistik
// Mengembalikan ringkasan data kependudukan desa.

import { NextResponse } from "next/server";
import { ambilStatistik } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET() {
  const data = await ambilStatistik();
  return NextResponse.json({ ok: true, data });
}