import Image from "next/image";
import Link from "next/link";
import { tanggalSingkat, potongTeks } from "@/lib/settings";

type ArticleCardProps = {
  artikel: {
    id: number;
    judul: string;
    slug: string | null;
    gambar: string | null;
    isi: string;
    tgl_upload: Date | string;
    kategori?: { kategori: string; slug: string | null } | null;
    author?: { nama: string } | null;
  };
  varian?: "default" | "lead" | "compact" | "quote";
};

export function ArticleCard({ artikel, varian = "default" }: ArticleCardProps) {
  const href = `/artikel/${artikel.slug ?? artikel.id}`;
  const ringkasan = potongTeks(artikel.isi.replace(/<[^>]+>/g, " "), varian === "lead" ? 220 : 130);

  if (varian === "lead") {
    return (
      <article className="grid gap-6 border-b border-ink/15 pb-10 lg:grid-cols-12">
        {artikel.gambar ? (
          <Link href={href} className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
              <Image
                src={artikel.gambar}
                alt={artikel.judul}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          </Link>
        ) : null}
        <div className="lg:col-span-5 lg:pl-2">
          {artikel.kategori ? (
            <p className="meta mb-3">
              <Link
                href={`/artikel?kategori=${artikel.kategori.slug ?? artikel.kategori.kategori}`}
                className="hover:text-clay"
              >
                {artikel.kategori.kategori}
              </Link>
            </p>
          ) : null}
          <Link href={href}>
            <h2 className="font-serif text-headline leading-snug hover:text-clay">
              {artikel.judul}
            </h2>
          </Link>
          <p className="mt-4 text-base text-ink-soft">{ringkasan}</p>
          <p className="meta mt-6">
            <span>{tanggalSingkat(artikel.tgl_upload)}</span>
            {artikel.author?.nama ? (
              <>
                <span aria-hidden> · </span>
                <span>{artikel.author.nama}</span>
              </>
            ) : null}
          </p>
        </div>
      </article>
    );
  }

  if (varian === "compact") {
    return (
      <article className="border-b border-ink/10 py-5">
        <p className="meta mb-2">
          {artikel.kategori?.kategori ?? "Artikel"}
          <span aria-hidden> · </span>
          {tanggalSingkat(artikel.tgl_upload)}
        </p>
        <Link href={href}>
          <h3 className="font-serif text-lg leading-snug hover:text-clay">
            {artikel.judul}
          </h3>
        </Link>
      </article>
    );
  }

  return (
    <article className="flex flex-col">
      {artikel.gambar ? (
        <Link href={href} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
            <Image
              src={artikel.gambar}
              alt={artikel.judul}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 hover:scale-[1.02]"
            />
          </div>
        </Link>
      ) : (
        <div className="aspect-[4/3] border border-ink/10 bg-paper-dim" aria-hidden />
      )}
      <div className="mt-4 flex flex-col">
        {artikel.kategori ? (
          <p className="meta mb-2">
            <Link
              href={`/artikel?kategori=${artikel.kategori.slug ?? artikel.kategori.kategori}`}
              className="hover:text-clay"
            >
              {artikel.kategori.kategori}
            </Link>
          </p>
        ) : null}
        <Link href={href}>
          <h3 className="font-serif text-xl leading-snug hover:text-clay">
            {artikel.judul}
          </h3>
        </Link>
        <p className="mt-3 text-sm text-ink-soft">{ringkasan}</p>
        <p className="meta mt-4">
          <span>{tanggalSingkat(artikel.tgl_upload)}</span>
          {artikel.author?.nama ? (
            <>
              <span aria-hidden> · </span>
              <span>{artikel.author.nama}</span>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
}