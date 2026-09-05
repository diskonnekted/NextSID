// Halaman detail satu Kelompok.
// Route: /admin/kelompok/[jenis]/[id]
// - jenis: salah satu dari 6 JenisKelompok (pekerjaan|pendidikan|agama|...)
// - id:    id referensi di tabel Ref* yang dipilih
// Menampilkan ringkasan + tabel anggota paginasi.

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  JENIS_KELOMPOK,
  LABEL_JENIS_KELOMPOK,
  ambilInfoKelompok,
  ambilDaftarAnggotaKelompok,
  type JenisKelompok,
} from "@/modules/kependudukan";
import PanelDetailKelompok from "./_panel";

export const dynamic = "force-dynamic";

type Params = { jenis: string; id: string };
type SearchParams = { halaman?: string };

function isJenis(v: string | undefined): v is JenisKelompok {
  return !!v && (JENIS_KELOMPOK as readonly string[]).includes(v);
}

export default async function DetailKelompokPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { jenis, id } = await params;
  const sp = await searchParams;

  if (!isJenis(jenis)) notFound();

  const idNum = Number(id);
  if (!Number.isFinite(idNum) || idNum <= 0) notFound();

  const halaman = Math.max(1, Number(sp.halaman) || 1);

  const [info, daftar] = await Promise.all([
    ambilInfoKelompok(jenis, idNum),
    ambilDaftarAnggotaKelompok({ jenis, id: idNum, halaman, perHalaman: 20 }),
  ]);
  if (!info) notFound();

  // Serialisasi Date → string untuk client component
  const daftarSerializable = {
    ...daftar,
    baris: daftar.baris.map((b) => ({
      ...b,
      tanggallahir: b.tanggallahir ? b.tanggallahir.toISOString() : null,
    })),
  };

  return (
    <div className="space-y-8">
      {/* === BREADCRUMB === */}
      <nav className="meta flex items-center gap-2">
        <Link href="/" className="hover:text-clay">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin" className="hover:text-clay">
          Dasbor
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/kependudukan" className="hover:text-clay">
          Kependudukan
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/kelompok?jenis=${jenis}`} className="hover:text-clay">
          {LABEL_JENIS_KELOMPOK[jenis]}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Detail</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">
          Kependudukan · Kelompok · {LABEL_JENIS_KELOMPOK[jenis]}
        </p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          {info.nama}
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar warga yang termasuk dalam kelompok {info.nama.toLowerCase()}.
          Klik baris untuk membuka detail lengkap per penduduk.
        </p>
      </header>

      <PanelDetailKelompok
        info={info}
        label={LABEL_JENIS_KELOMPOK[jenis]}
        daftar={daftarSerializable as any}
      />

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <Link
          href={`/admin/kelompok?jenis=${jenis}`}
          className="link-clay"
        >
          ← Kembali ke rekap {LABEL_JENIS_KELOMPOK[jenis]}
        </Link>
      </aside>
    </div>
  );
}