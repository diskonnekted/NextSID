import { ambilConfig } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Desa",
  description: "Galeri foto dan dokumen kegiatan desa.",
};

export default async function GaleriPage() {
  const config = await ambilConfig();

  const gambar = await prisma.artikel.findMany({
    where: { gambar: { not: null }, enabled: 1 },
    orderBy: { tgl_upload: "desc" },
    select: {
      id: true,
      judul: true,
      gambar: true,
      slug: true,
      tgl_upload: true,
    },
    take: 24,
  });

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="mb-12 border-b border-ink/15 pb-8">
        <p className="meta mb-3">Galeri</p>
        <h1 className="font-serif text-display-md leading-tight">
          Galeri {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-4 max-w-prose text-ink-muted">
          Dokumentasi foto dan kegiatan Pemerintah Desa serta aktivitas warga.
        </p>
      </header>

      {gambar.length === 0 ? (
        <div className="border border-dashed border-ink/20 p-10 text-center text-sm text-ink-muted">
          Belum ada foto yang diunggah.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gambar.map((g) => (
            <li key={g.id} className="border border-ink/15 bg-paper">
              <div className="relative aspect-[4/3] bg-paper-dim">
                {g.gambar ? (
                  <Image
                    src={`/uploads/artikel/${g.gambar}`}
                    alt={g.judul}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="p-4">
                <p className="font-serif text-base leading-snug">{g.judul}</p>
                {g.tgl_upload ? (
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(g.tgl_upload).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}