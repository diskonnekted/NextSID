import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const kategoriId = parseInt(id, 10);

  if (isNaN(kategoriId)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await prisma.kategori.delete({ where: { id: kategoriId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete kategori error:", err);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
