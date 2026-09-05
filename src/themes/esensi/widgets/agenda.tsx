// Widget agenda — port dari OpenSID tema esensi widgets/agenda.blade.php.
// Menampilkan jadwal kegiatan desa terdekat dari artikel berkategori tertentu.
// (Untuk MVP: ambil 5 artikel terbaru berkategori "Pengumuman" sebagai proxy.)

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { tanggalSingkat } from "@/lib/settings";

export async function WidgetAgenda({ judul = "Agenda Desa" }: { judul?: string }) {
  const items = await prisma.artikel.findMany({
    where: {
      enabled: 1,
      tgl_upload: { lte: new Date() },
      kategori: { kategori: { contains: "Pengumuman" } },
    },
    select: {
      id: true,
      judul: true,
      slug: true,
      tgl_upload: true,
    },
    orderBy: { tgl_upload: "desc" },
    take: 5,
  });

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="agenda-heading">
      <h2 id="agenda-heading" className="meta mb-4">{judul}</h2>
      <ul className="divide-y divide-ink/10">
        {items.map((item) => (
          <li key={item.id} className="py-3">
            <p className="meta mb-1">{tanggalSingkat(item.tgl_upload)}</p>
            <Link href={`/artikel/${item.slug ?? item.id}`} className="font-serif text-base leading-snug hover:text-clay">
              {item.judul}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WidgetAgenda;