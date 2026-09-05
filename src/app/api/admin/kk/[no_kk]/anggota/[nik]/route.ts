// PATCH /api/admin/kk/[no_kk]/anggota/[nik] — body: { ... fields, nik? }
// DELETE /api/admin/kk/[no_kk]/anggota/[nik]
//
// Edit / hapus satu anggota KK (by NIK). Partial update: hanya field yang
// dikirim (key ada di body) yang di-update. Field lain tetap nilai lama.

import { NextRequest, NextResponse } from "next/server";
import { editAnggota, hapusAnggota } from "@/modules/kependudukan";

export const runtime = "nodejs";

function toOptInt(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
function toOptStr(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  return String(v);
}
function toOptDate(v: unknown): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ no_kk: string; nik: string }> },
) {
  try {
    const { no_kk, nik } = await params;
    const body = await req.json();
    const args: any = {
      nikAsal: nik,
      no_kk,
      nik: "nik" in body && body.nik ? String(body.nik).trim() : nik,
      nama: "nama" in body ? String(body.nama ?? "").trim() : "",
    };
    if ("sex" in body) args.sex = toOptInt(body.sex);
    if ("tempatlahir" in body) args.tempatlahir = toOptStr(body.tempatlahir);
    if ("tanggallahir" in body) args.tanggallahir = toOptDate(body.tanggallahir);
    if ("kk_level" in body) args.kk_level = toOptInt(body.kk_level);
    if ("agama_id" in body) args.agama_id = toOptInt(body.agama_id);
    if ("pekerjaan_id" in body) args.pekerjaan_id = toOptInt(body.pekerjaan_id);
    if ("status_kawin" in body) args.status_kawin = toOptInt(body.status_kawin);
    if ("pendidikan_kk_id" in body)
      args.pendidikan_kk_id = toOptInt(body.pendidikan_kk_id);
    if ("warganegara_id" in body)
      args.warganegara_id = toOptInt(body.warganegara_id);
    if ("golongan_darah_id" in body)
      args.golongan_darah_id = toOptInt(body.golongan_darah_id);
    await editAnggota(args);
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
  { params }: { params: Promise<{ no_kk: string; nik: string }> },
) {
  try {
    const { nik } = await params;
    await hapusAnggota(nik);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 400 },
    );
  }
}