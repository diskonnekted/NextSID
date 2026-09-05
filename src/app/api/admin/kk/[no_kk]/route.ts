// PATCH /api/admin/kk/[no_kk] — body: { alamat?, dusun?, rw?, rt? }
// DELETE /api/admin/kk/[no_kk] — hapus KK (+ semua anggota via cascade SetNull)
//
// Edit/Hapus data KK.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hapusKK } from "@/modules/kependudukan";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ no_kk: string }> },
) {
  try {
    const { no_kk } = await params;
    const body = await req.json();
    // Hanya update field yang dikirim (bukan null/undefined).
    const data: {
      alamat?: string | null;
      dusun?: string | null;
      rw?: string | null;
      rt?: string | null;
    } = {};
    if ("alamat" in body) data.alamat = body.alamat;
    if ("dusun" in body) data.dusun = body.dusun;
    if ("rw" in body) data.rw = body.rw;
    if ("rt" in body) data.rt = body.rt;
    await prisma.keluarga.update({ where: { no_kk }, data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ no_kk: string }> },
) {
  try {
    const { no_kk } = await params;
    await hapusKK(no_kk);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 400 },
    );
  }
}
