"use client";

// Error boundary untuk App Router (catch-all untuk route segments).
// Di-render saat ada runtime error di salah satu halaman/segment.
// Wajib ada sejak Next.js 13.4+, kalau tidak muncul
// "missing required error components" di dev overlay.

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console; di produksi bisa kirim ke Sentry dsb.
    console.error("[NextSID] Unhandled error:", error);
  }, [error]);

  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl border border-ink/15 bg-paper p-8">
        <p className="meta mb-2">Terjadi Kesalahan</p>
        <h1 className="font-serif text-3xl leading-tight lg:text-4xl">
          Halaman Tidak Dapat Ditampilkan
        </h1>
        <p className="mt-3 text-ink-muted">
          Sistem mengalami galat saat memuat halaman ini. Coba muat ulang,
          atau kembali ke beranda.
        </p>

        {error.digest && (
          <p className="meta mt-4 border-t border-ink/10 pt-3 text-2xs text-ink-muted">
            Kode galat: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="meta border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="meta border border-ink/20 bg-paper px-4 py-2 text-center normal-case tracking-normal hover:border-ink"
          >
            Ke Beranda
          </Link>
        </div>

        <details className="mt-6 border-t border-ink/10 pt-4 text-sm">
          <summary className="meta cursor-pointer">Detail teknis</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded border border-ink/10 bg-ink/5 p-3 font-mono text-xs text-ink-muted">
            {error.message || "Tidak ada pesan."}
          </pre>
        </details>
      </div>
    </div>
  );
}