import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  try {
    await prisma.artikel.delete({ where: { id: articleId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete artikel error:", err);
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}
