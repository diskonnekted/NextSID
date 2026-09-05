// GET /api/admin/kependudukan/penduduk?halaman=1&perHalaman=20&cari=
// Mengembalikan daftar penduduk paginasi dengan relasi KK & Ref*.

import { NextRequest, NextResponse } from "next/server";
import { ambilDaftarPenduduk } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const halaman = Math.max(1, parseInt(searchParams.get("halaman") ?? "1", 10) || 1);
  const perHalaman = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("perHalaman") ?? "20", 10) || 20),
  );
  const cari = searchParams.get("cari")?.trim() || undefined;
  const data = await ambilDaftarPenduduk({ halaman, perHalaman, cari });
  return NextResponse.json({ ok: true, ...data });
}