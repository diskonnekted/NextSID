import Link from "next/link";
import { ambilConfig } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Surat Mandiri",
  description: "Layanan mandiri pengajuan surat untuk warga desa.",
};

export default async function SuratMandiriPage() {
  const config = await ambilConfig();

  const format = await prisma.suratFormat.findMany({
    where: { mandiri: 1 },
    orderBy: [{ id: "asc" }],
    select: {
      id: true,
      nama: true,
      kode_surat: true,
      url_surat: true,
    },
    take: 60,
  });

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="mb-12 border-b border-ink/15 pb-8">
        <p className="meta mb-3">Layanan Mandiri</p>
        <h1 className="font-serif text-display-md leading-tight">
          Surat {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-4 max-w-prose text-ink-muted">
          Ajukan surat keterangan dan surat resmi lainnya secara daring. Pilih
          jenis surat di bawah, isi data yang diminta, dan unduh hasilnya
          setelah permohonan diverifikasi oleh petugas desa.
        </p>
      </header>

      <section aria-labelledby="daftar-jenis" className="grid gap-6">
        <h2 id="daftar-jenis" className="font-serif text-headline">
          Jenis Surat Tersedia
        </h2>

        {format.length === 0 ? (
          <div className="border border-dashed border-ink/20 p-10 text-center">
            <p className="text-sm text-ink-muted">
              Belum ada format surat yang dipublikasikan untuk layanan mandiri.
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Silakan hubungi kantor desa untuk informasi lebih lanjut.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {format.map((f) => (
              <li
                key={f.id}
                className="flex flex-col border border-ink/15 bg-paper p-5 transition-colors hover:border-clay"
              >
                <p className="meta">{f.kode_surat ? `Kode ${f.kode_surat}` : "Surat"}</p>
                <h3 className="mt-2 font-serif text-lg leading-tight">{f.nama}</h3>
                {f.url_surat ? (
                  <p className="mt-2 text-xs text-ink-muted font-mono">
                    {f.url_surat}
                  </p>
                ) : null}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/surat-mandiri/${f.id}`}
                    className="link-clay text-sm"
                  >
                    Ajukan Surat Ini →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 border-t border-ink/15 pt-10">
        <h2 className="font-serif text-headline mb-4">Alur Layanan</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {[
            "Pilih jenis surat",
            "Isi formulir daring",
            "Verifikasi oleh petugas",
            "Unduh surat yang sudah jadi",
          ].map((s, i) => (
            <li key={s} className="border border-ink/15 bg-paper p-4">
              <p className="meta">Langkah {i + 1}</p>
              <p className="mt-1 font-medium">{s}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}