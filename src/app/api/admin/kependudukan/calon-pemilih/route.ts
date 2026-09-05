// GET /api/admin/kependudukan/calon-pemilih?halaman=1&perHalaman=20
// Mengembalikan daftar calon pemilih potensial (>=17 th, WNI, status hidup).

import { NextRequest, NextResponse } from "next/server";
import { ambilDaftarCalonPemilih } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const halaman = Math.max(
    1,
    parseInt(searchParams.get("halaman") ?? "1", 10) || 1,
  );
  const perHalaman = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("perHalaman") ?? "20", 10) || 20),
  );
  const data = await ambilDaftarCalonPemilih({ halaman, perHalaman });
  return NextResponse.json({ ok: true, ...data });
}