// Halaman 404 (Not Found).
// Di-render otomatis saat ada segment route yang tidak ditemukan.

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl border border-ink/15 bg-paper p-8">
        <p className="meta mb-2">404 · Tidak Ditemukan</p>
        <h1 className="font-serif text-4xl leading-tight lg:text-5xl">
          Halaman Tidak Ditemukan
        </h1>
        <p className="mt-3 text-ink-muted">
          Halaman yang Anda cari tidak ada atau telah dipindahkan. Periksa
          kembali alamat URL, atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/"
            className="meta border border-ink bg-ink px-4 py-2 text-center normal-case tracking-normal text-paper hover:bg-clay"
          >
            Ke Beranda
          </Link>
          <Link
            href="/admin"
            className="meta border border-ink/20 bg-paper px-4 py-2 text-center normal-case tracking-normal hover:border-ink"
          >
            Ke Dasbor
          </Link>
        </div>
      </div>
    </div>
  );
}