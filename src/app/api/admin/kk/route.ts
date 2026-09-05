// GET /api/admin/kk?halaman=1&perHalaman=20&cari=
// POST /api/admin/kk — body: { no_kk, alamat?, dusun?, rw?, rt?, kepala: {...} }
//
// GET: daftar KK paginasi.
// POST: buat KK baru + kepala keluarga dalam satu transaksi.

import { NextRequest, NextResponse } from "next/server";
import { ambilDaftarKK, buatKKBaru } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const halaman = Math.max(1, parseInt(searchParams.get("halaman") ?? "1", 10) || 1);
  const perHalaman = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("perHalaman") ?? "20", 10) || 20),
  );
  const cari = searchParams.get("cari")?.trim() || undefined;
  const data = await ambilDaftarKK({ halaman, perHalaman, cari });
  return NextResponse.json({ ok: true, ...data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await buatKKBaru({
      no_kk: String(body.no_kk ?? "").trim(),
      alamat: body.alamat ?? null,
      dusun: body.dusun ?? null,
      rw: body.rw ?? null,
      rt: body.rt ?? null,
      kepala: {
        nik: String(body.kepala?.nik ?? "").trim(),
        nama: String(body.kepala?.nama ?? "").trim(),
        sex: body.kepala?.sex ?? null,
        tempatlahir: body.kepala?.tempatlahir ?? null,
        tanggallahir: body.kepala?.tanggallahir
          ? new Date(body.kepala.tanggallahir)
          : null,
        agama_id: body.kepala?.agama_id ?? null,
        pekerjaan_id: body.kepala?.pekerjaan_id ?? null,
        status_kawin: body.kepala?.status_kawin ?? null,
        pendidikan_kk_id: body.kepala?.pendidikan_kk_id ?? null,
        warganegara_id: body.kepala?.warganegara_id ?? null,
        golongan_darah_id: body.kepala?.golongan_darah_id ?? null,
      },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 400 },
    );
  }
}