// Halaman tambah satu Penduduk secara manual (form UI, bukan Excel).
// Beda dengan tambah KK: penduduk boleh disimpan tanpa terikat KK
// (mis. pendatang baru yang belum tercatat di KK manapun).

import Link from "next/link";
import { ambilReferensiPenduduk } from "@/modules/kependudukan";
import { ambilDaftarKKUntukDropdown } from "@/modules/kependudukan/handler";
import FormPendudukBaru from "./_form";

export const dynamic = "force-dynamic";

type Ref = { id: number; nama: string };
type KKOption = { no_kk: string; kepala: string | null };

export default async function TambahPendudukPage() {
  const [ref, kkList] = await Promise.all([
    ambilReferensiPenduduk(),
    ambilDaftarKKUntukDropdown(),
  ]);

  const refData = {
    agama: ref.agama.map((r) => ({ id: r.id, nama: r.nama })),
    pekerjaan: ref.pekerjaan.map((r) => ({ id: r.id, nama: r.nama })),
    statusKawin: ref.statusKawin.map((r) => ({ id: r.id, nama: r.nama })),
    pendidikan: ref.pendidikan.map((r) => ({ id: r.id, nama: r.nama })),
    hubunganKK: ref.hubunganKK.map((r) => ({ id: r.id, nama: r.nama })),
    warganegara: ref.warganegara.map((r) => ({ id: r.id, nama: r.nama })),
    golonganDarah: ref.golonganDarah.map((r) => ({ id: r.id, nama: r.nama })),
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
        <span className="text-ink">Tambah Penduduk</span>
      </nav>

      <header className="mb-12 border-b border-ink/15 pb-6">
        <p className="meta mb-2">Dasbor Admin · Kependudukan</p>
        <h1 className="font-serif text-4xl leading-tight lg:text-5xl">
          Tambah Penduduk
        </h1>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Catat satu penduduk secara manual. Penduduk boleh terikat pada
          Kartu Keluarga yang sudah ada, atau disimpan terpisah (misalnya
          pendatang yang belum mendaftarkan KK).
        </p>
      </header>

      <FormPendudukBaru refData={refData} kkList={kkList as KKOption[]} />

      <aside className="mt-12 border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kependudukan" className="link-clay">
          ← Kembali ke Kependudukan
        </Link>
      </aside>
    </div>
  );
}