// Halaman detail satu Penduduk.
// Menampilkan info lengkap + panel CRUD (edit inline + hapus).
// Route param adalah NIK (lebih human-readable daripada id auto-increment).

import Link from "next/link";
import { notFound } from "next/navigation";
import { ambilReferensiPenduduk } from "@/modules/kependudukan";
import {
  ambilDetailPenduduk,
  ambilDaftarKKUntukDropdown,
} from "@/modules/kependudukan/handler";
import PanelDetailPenduduk from "./_panel";

export const dynamic = "force-static"
export const revalidate = 60;

type Params = { nik: string };

function formatTanggal(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function DetailPendudukPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { nik } = await params;
  const [detail, ref, kkList] = await Promise.all([
    ambilDetailPenduduk(nik),
    ambilReferensiPenduduk(),
    ambilDaftarKKUntukDropdown(),
  ]);
  if (!detail) notFound();

  // Serialisasi ke client component (Date → string)
  const detailSerializable = {
    ...detail,
    tanggallahir: detail.tanggallahir
      ? (detail.tanggallahir instanceof Date ? detail.tanggallahir.toISOString() : detail.tanggallahir)
      : null,
    tanggal_akhir_paspor: detail.tanggal_akhir_paspor
      ? (detail.tanggal_akhir_paspor instanceof Date ? (detail.tanggal_akhir_paspor as any).toISOString() : String(detail.tanggal_akhir_paspor))
      : null,
    tanggalperkawinan: detail.tanggalperkawinan
      ? (detail.tanggalperkawinan instanceof Date ? (detail.tanggalperkawinan as any).toISOString() : String(detail.tanggalperkawinan))
      : null,
    tanggalperceraian: detail.tanggalperceraian
      ? (detail.tanggalperceraian instanceof Date ? (detail.tanggalperceraian as any).toISOString() : String(detail.tanggalperceraian))
      : null,
    created_at: detail.created_at ? detail.created_at.toISOString() : null,
    updated_at: detail.updated_at ? detail.updated_at.toISOString() : null,
  };

  return (
    <div className="container-page py-12 lg:py-16">
      <nav className="meta mb-6 flex items-center gap-2">
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
        <span className="text-ink">Detail Penduduk</span>
      </nav>

      <header className="mb-12 border-b border-ink/15 pb-6">
        <p className="meta mb-2">Penduduk</p>
        <h1 className="font-serif text-4xl leading-tight lg:text-5xl">
          {detail.nama}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          NIK{" "}
          <span className="font-mono text-base text-ink">{detail.nik}</span>{" "}
          ·{" "}
          {detail.sex === 1
            ? "Laki-laki"
            : detail.sex === 2
              ? "Perempuan"
              : "—"}
          {detail.tempatlahir ? ` · ${detail.tempatlahir}` : ""}
          {detail.tanggallahir
            ? ` · ${formatTanggal(detail.tanggallahir)}`
            : ""}
        </p>
      </header>

      <PanelDetailPenduduk
        detail={detailSerializable as any}
        refData={{
          agama: ref.agama.map((r) => ({ id: r.id, nama: r.nama })),
          pekerjaan: ref.pekerjaan.map((r) => ({ id: r.id, nama: r.nama })),
          statusKawin: ref.statusKawin.map((r) => ({ id: r.id, nama: r.nama })),
          pendidikan: ref.pendidikan.map((r) => ({ id: r.id, nama: r.nama })),
          hubunganKK: ref.hubunganKK.map((r) => ({ id: r.id, nama: r.nama })),
          warganegara: ref.warganegara.map((r) => ({ id: r.id, nama: r.nama })),
          golonganDarah: ref.golonganDarah.map((r) => ({
            id: r.id,
            nama: r.nama,
          })),
          cacat: ref.cacat.map((r) => ({ id: r.id, nama: r.nama })),
          caraKB: ref.caraKB.map((r) => ({ id: r.id, nama: r.nama })),
          statusDasar: ref.statusDasar.map((r) => ({ id: r.id, nama: r.nama })),
          asuransi: ref.asuransi.map((r) => ({ id: r.id, nama: r.nama })),
        }}
        kkList={kkList}
      />

      <aside className="mt-12 border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kependudukan" className="link-clay">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}