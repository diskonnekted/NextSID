// Halaman admin kependudukan.
// Komposisi:
//   - Ringkasan statistik (KK, penduduk, laki/perempuan)
//   - Upload Excel + hasil import
//   - Pencarian + tabel penduduk paginasi
//   - Tombol download template & export data
//
// Pendekatan: client component untuk interaksi upload + paginasi,
// data statistik & daftar pertama di-render di server.

import Link from "next/link";
import { ambilStatistik, ambilDaftarPenduduk } from "@/modules/kependudukan";
import PanelKelola from "./_panel";

export const dynamic = "force-dynamic";

export default async function AdminKependudukanPage({
  searchParams,
}: {
  searchParams: Promise<{
    halaman?: string;
    perHalaman?: string;
    cari?: string;
  }>;
}) {
  const sp = await searchParams;
  const halaman = Math.max(1, parseInt(sp.halaman ?? "1", 10) || 1);
  const perHalaman = Math.min(100, Math.max(5, parseInt(sp.perHalaman ?? "20", 10) || 20));
  const cari = sp.cari?.trim() || undefined;

  const [statistik, daftar] = await Promise.all([
    ambilStatistik(),
    ambilDaftarPenduduk({ halaman, perHalaman, cari }),
  ]);

  return (
    <div className="container-page py-12 lg:py-16">
      <nav className="meta mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-clay">Beranda</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin" className="hover:text-clay">Dasbor</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Kependudukan</span>
      </nav>

      <header className="mb-12 border-b border-ink/15 pb-6">
        <p className="meta mb-2">Dasbor Admin</p>
        <h1 className="font-serif text-4xl leading-tight lg:text-5xl">
          Kependudukan
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Impor data penduduk dari Excel, telusuri basis data keluarga dan
          penduduk, atau ekspor kembali ke format yang sama untuk dibagikan
          kepada perangkat desa lain.
        </p>
      </header>

      <PanelKelola
        statistik={statistik}
        daftarAwal={daftar}
        cariAwal={cari ?? ""}
      />
    </div>
  );
}