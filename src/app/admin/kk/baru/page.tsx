// Halaman tambah Kartu Keluarga baru.
// Form ini sekaligus mencatat kepala keluarga (wajib ada di setiap KK).
// Data referensi dropdown (agama, pekerjaan, dll.) dimuat di server
// component lalu diserialisasi ke client component untuk form.

import Link from "next/link";
import { ambilReferensiPenduduk, ambilConfigId } from "@/modules/kependudukan";
import FormKKBaru from "./_form";

export const dynamic = "force-dynamic";

// Serialisasi aman untuk client component: hanya field primitif.
type Ref = { id: number; nama: string };
type RefSet = {
  agama: Ref[];
  pekerjaan: Ref[];
  statusKawin: Ref[];
  pendidikan: Ref[];
  warganegara: Ref[];
  golonganDarah: Ref[];
};

function toRef(rows: Array<{ id: number; nama: string }>): Ref[] {
  return rows.map((r) => ({ id: r.id, nama: r.nama }));
}

export default async function TambahKKPage() {
  const [ref, configId] = await Promise.all([
    ambilReferensiPenduduk(),
    ambilConfigId(),
  ]);

  const refSet: RefSet = {
    agama: toRef(ref.agama),
    pekerjaan: toRef(ref.pekerjaan),
    statusKawin: toRef(ref.statusKawin),
    pendidikan: toRef(ref.pendidikan),
    warganegara: toRef(ref.warganegara),
    golonganDarah: toRef(ref.golonganDarah),
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
        <Link href="/admin/kk" className="hover:text-clay">
          Kartu Keluarga
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">Tambah KK</span>
      </nav>

      <header className="border-b border-ink/15 pb-6">
        <p className="meta mb-2">Kependudukan · KK · Tambah</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Tambah Kartu Keluarga Baru
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Catat satu KK lengkap dengan kepala keluarganya. Setelah tersimpan,
          Anda dapat menambahkan anggota keluarga (istri, anak, dll.) dari
          halaman detail KK.
        </p>
      </header>

      <FormKKBaru refData={refSet} configId={configId} />

      <aside className="border-t border-ink/15 pt-6 text-sm">
        <Link href="/admin/kk" className="link-clay">
          ← Kembali ke daftar KK
        </Link>
      </aside>
    </div>
  );
}
