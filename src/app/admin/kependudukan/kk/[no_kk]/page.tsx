// Halaman detail satu Kartu Keluarga.
// Menampilkan info KK + daftar anggotanya, dengan panel CRUD inline
// (edit KK, hapus KK, tambah anggota, edit/hapus per-anggota).

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ambilDetailKK,
  ambilReferensiPenduduk,
} from "@/modules/kependudukan";
import PanelDetailKK from "./_panel-kk";

export const dynamic = "force-static"
export const revalidate = 60;

type Params = { no_kk: string };

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

export default async function DetailKKPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { no_kk } = await params;
  const [detail, ref] = await Promise.all([
    ambilDetailKK(no_kk),
    ambilReferensiPenduduk(),
  ]);
  if (!detail) notFound();

  const { kk, statistik, kepala, anggota } = detail;

  // Serialisasi ke client component (Date → string)
  const anggotaSerializable = anggota.map((a) => ({
    ...a,
    tanggallahir: a.tanggallahir
      ? a.tanggallahir.toISOString()
      : null,
  }));

  return (
    <div className="container-page py-12 lg:py-16">
      {/* === BREADCRUMB === */}
      <nav className="meta mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-clay">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin" className="hover:text-clay">
          Dasbor
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/kk" className="hover:text-clay">
          Kartu Keluarga
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Detail KK</span>
      </nav>

      {/* === HEADER === */}
      <header className="mb-12 border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kartu Keluarga</p>
        <h1 className="font-serif text-3xl leading-tight tabular-nums lg:text-4xl">
          {kk.no_kk}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          {kk.alamat ?? "Alamat belum tercatat"}
          {kk.dusun ? ` · Dusun ${kk.dusun}` : ""}
          {(kk.rt || kk.rw) ? ` · RT ${kk.rt ?? "—"}/RW ${kk.rw ?? "—"}` : ""}
        </p>
        {kepala && (
          <p className="mt-3 text-sm text-ink-soft">
            Kepala Keluarga:{" "}
            <span className="font-medium text-ink">{kepala.nama}</span>{" "}
            <span className="meta">· NIK {kepala.nik}</span>
          </p>
        )}
      </header>

      {/* === STATISTIK KK === */}
      <section aria-labelledby="stat-heading" className="mb-12">
        <h2 id="stat-heading" className="meta mb-4">
          Ringkasan KK
        </h2>
        <dl className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10">
          <div className="bg-paper px-4 py-5">
            <dt className="meta">Total Anggota</dt>
            <dd className="mt-2 font-serif text-3xl tabular-nums">
              {statistik.total.toLocaleString("id-ID")}
            </dd>
          </div>
          <div className="bg-paper px-4 py-5">
            <dt className="meta">Laki-laki</dt>
            <dd className="mt-2 font-serif text-3xl tabular-nums">
              {statistik.lakiLaki.toLocaleString("id-ID")}
            </dd>
          </div>
          <div className="bg-paper px-4 py-5">
            <dt className="meta">Perempuan</dt>
            <dd className="mt-2 font-serif text-3xl tabular-nums">
              {statistik.perempuan.toLocaleString("id-ID")}
            </dd>
          </div>
        </dl>
      </section>

      {/* === PANEL CRUD (client) === */}
      <PanelDetailKK
        kk={{
          no_kk: kk.no_kk,
          alamat: kk.alamat,
          dusun: kk.dusun,
          rw: kk.rw,
          rt: kk.rt,
        }}
        anggota={anggotaSerializable}
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
        }}
      />

      {/* === META TAMBAHAN === */}
      <section
        aria-labelledby="meta-heading"
        className="mt-12 border-t border-ink/15 pt-6"
      >
        <h2 id="meta-heading" className="meta mb-3">
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm text-ink-muted lg:grid-cols-2">
          <div>
            <dt className="meta">Dicatat sejak</dt>
            <dd className="font-serif text-base text-ink">
              {formatTanggal(kk.created_at)}
            </dd>
          </div>
          <div>
            <dt className="meta">Pembaruan terakhir</dt>
            <dd className="font-serif text-base text-ink">
              {formatTanggal(kk.updated_at)}
            </dd>
          </div>
        </dl>
      </section>

      {/* === KEMBALI === */}
      <aside className="mt-12 border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kk" className="link-clay">
          ← Kembali ke daftar KK
        </Link>
      </aside>
    </div>
  );
}
