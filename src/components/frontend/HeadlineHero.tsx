import Image from "next/image";
import Link from "next/link";
import { tanggalIndonesia, potongTeks, waktuBaca } from "@/lib/settings";

type ArtikelHeadline = {
  id: number;
  slug: string | null;
  judul: string;
  isi: string;
  gambar: string | null;
  kategori?: { judul: string; slug: string } | null;
  createdAt?: Date | string;
};

type HeadlineProps = {
  artikel: ArtikelHeadline;
};

export function HeadlineHero({ artikel }: HeadlineProps) {
  const href = `/artikel/${artikel.slug ?? artikel.id}`;
  const ringkasan = potongTeks(artikel.isi.replace(/<[^>]+>/g, " "), 240);
  const menit = waktuBaca(artikel.isi);
  const tanggal = artikel.createdAt
    ? tanggalIndonesia(artikel.createdAt)
    : null;

  return (
    <section className="border-b border-ink/15 pb-12">
      <p className="meta mb-6">Berita Utama</p>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {artikel.gambar ? (
          <Link href={href} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
              <Image
                src={artikel.gambar}
                alt={artikel.judul}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          </Link>
        ) : null}
        <div className="flex min-w-0 flex-col justify-center lg:col-span-5">
          {artikel.kategori ? (
            <p className="meta mb-4">
              <Link
                href={`/kategori/${artikel.kategori.slug}`}
                className="hover:text-clay"
              >
                {artikel.kategori.judul}
              </Link>
            </p>
          ) : null}
          <Link href={href}>
            <h2 className="text-balance break-words font-serif text-display-md leading-[1.08] hover:text-clay lg:text-display-sm">
              {artikel.judul}
            </h2>
          </Link>
          <p className="mt-6 max-w-prose text-lg text-ink-soft">{ringkasan}</p>
          <p className="meta mt-8">
            {tanggal ? <span>{tanggal}</span> : null}
            {tanggal ? <span aria-hidden> · </span> : null}
            <span>{menit} menit baca</span>
          </p>
        </div>
      </div>
    </section>
  );
}