// POST /api/admin/kk/[no_kk]/anggota — body: { nik, nama, sex?, ... }
//   Tambah anggota baru ke KK.

import { NextRequest, NextResponse } from "next/server";
import { tambahAnggota } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ no_kk: string }> },
) {
  try {
    const { no_kk } = await params;
    const body = await req.json();
    const result = await tambahAnggota({
      no_kk,
      nik: String(body.nik ?? "").trim(),
      nama: String(body.nama ?? "").trim(),
      sex: body.sex ?? null,
      tempatlahir: body.tempatlahir ?? null,
      tanggallahir: body.tanggallahir ? new Date(body.tanggallahir) : null,
      kk_level: body.kk_level ?? 3,
      agama_id: body.agama_id ?? null,
      pekerjaan_id: body.pekerjaan_id ?? null,
      status_kawin: body.status_kawin ?? null,
      pendidikan_kk_id: body.pendidikan_kk_id ?? null,
      warganegara_id: body.warganegara_id ?? null,
      golongan_darah_id: body.golongan_darah_id ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 400 },
    );
  }
}